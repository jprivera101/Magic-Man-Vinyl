import "server-only";
import { prisma } from "@/lib/prisma";

/** Si el precio cambió (o es la primera vez que se usa este SKU), guarda una entrada en el historial de precios. */
export async function recordPriceIfNeeded(sku: string, price: number, productId: string) {
  const lastLog = await prisma.priceLog.findFirst({
    where: { sku },
    orderBy: { createdAt: "desc" },
  });
  if (!lastLog || Number(lastLog.price) !== price) {
    await prisma.priceLog.create({ data: { sku, price, productId } });
  }
}

function normalize(value: string) {
  return value.trim();
}

async function findExistingByName(artist: string, album: string) {
  return prisma.product.findFirst({
    where: {
      artist: { equals: normalize(artist), mode: "insensitive" },
      album: { equals: normalize(album), mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Asigna el SKU para un producto NUEVO: reutiliza el de un disco igual (mismo artista+álbum) o genera el siguiente correlativo. */
export async function resolveSkuForNewProduct(artist: string, album: string): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.product.findFirst({
      where: {
        artist: { equals: normalize(artist), mode: "insensitive" },
        album: { equals: normalize(album), mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
    });
    if (existing) return existing.sku;

    const counter = await tx.skuCounter.upsert({
      where: { id: 1 },
      update: { lastSku: { increment: 1 } },
      create: { id: 1, lastSku: 1 },
    });
    return `SKU${counter.lastSku}`;
  });
}

export type ProductLookup = {
  isNew: boolean;
  sku: string;
  lastPrice?: number;
  totalSold?: number;
};

/** Usado por el formulario de alta: avisa si ese artista+álbum ya existe en el inventario. */
export async function lookupByArtistAlbum(
  artist: string,
  album: string,
): Promise<ProductLookup | null> {
  if (!artist.trim() || !album.trim()) return null;

  const existing = await findExistingByName(artist, album);

  if (existing) {
    const [lastLog, sold] = await Promise.all([
      prisma.priceLog.findFirst({ where: { sku: existing.sku }, orderBy: { createdAt: "desc" } }),
      prisma.orderItem.aggregate({
        where: { product: { sku: existing.sku }, order: { status: { in: ["CONFIRMADO", "EN_TRANSITO", "EN_GUATEMALA", "ENVIADO"] } } },
        _sum: { quantity: true },
      }),
    ]);

    return {
      isNew: false,
      sku: existing.sku,
      lastPrice: lastLog ? Number(lastLog.price) : Number(existing.price),
      totalSold: sold._sum.quantity ?? 0,
    };
  }

  const counter = await prisma.skuCounter.findUnique({ where: { id: 1 } });
  return { isNew: true, sku: `SKU${(counter?.lastSku ?? 0) + 1}` };
}

export type SkuReportRow = {
  sku: string;
  artist: string;
  album: string;
  imageUrl: string;
  totalSold: number;
  lastPrice: number;
  currentPrice: number | null;
  listingsCount: number;
  availableUnits: number;
};

/** Reporte para el admin: un renglón por SKU con ventas, precios, stock y foto. */
export async function getSkuReport(): Promise<SkuReportRow[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        where: { order: { status: { not: "RECHAZADO" } } },
        select: { quantity: true },
      },
    },
  });

  const skus = [...new Set(products.map((p) => p.sku))];

  const rows = await Promise.all(
    skus.map(async (sku) => {
      const skuProducts = products.filter((p) => p.sku === sku);
      const latest = skuProducts[0];

      const lastLog = await prisma.priceLog.findFirst({
        where: { sku },
        orderBy: { createdAt: "desc" },
      });

      const sold = await prisma.orderItem.aggregate({
        where: { product: { sku }, order: { status: { in: ["CONFIRMADO", "EN_TRANSITO", "EN_GUATEMALA", "ENVIADO"] } } },
        _sum: { quantity: true },
      });
      const totalSold = sold._sum.quantity ?? 0;

      const availableUnits = skuProducts.reduce(
        (sum, p) =>
          sum +
          Math.max(
            0,
            p.units - p.orderItems.reduce((s, i) => s + i.quantity, 0),
          ),
        0,
      );

      return {
        sku,
        artist: latest.artist,
        album: latest.album,
        imageUrl: latest.imageUrl,
        totalSold,
        lastPrice: lastLog ? Number(lastLog.price) : Number(latest.price),
        currentPrice: Number(latest.price),
        listingsCount: skuProducts.length,
        availableUnits,
      };
    }),
  );

  return rows.sort((a, b) => {
    const an = Number(a.sku.replace(/\D/g, "")) || 0;
    const bn = Number(b.sku.replace(/\D/g, "")) || 0;
    return bn - an;
  });
}

export async function getSkuPriceHistory(sku: string) {
  const logs = await prisma.priceLog.findMany({
    where: { sku },
    orderBy: { createdAt: "desc" },
  });
  return logs.map((log) => ({ ...log, price: Number(log.price) }));
}
