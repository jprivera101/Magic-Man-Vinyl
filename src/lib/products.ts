import "server-only";
import { unstable_cache, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteProductImage } from "@/lib/storage";
import { recordPriceIfNeeded, resolveSkuForNewProduct } from "@/lib/sku";
import {
  getActivePromotionsMap,
  getActivePromotionForProduct,
  applyDiscount,
  type ActivePromotion,
} from "@/lib/promotions";
import type { ProductInput } from "@/lib/validation";
import type { Product } from "@/generated/prisma/client";

export const SORT_OPTIONS = {
  nuevo: "nuevo",
  az: "az",
  precio_asc: "precio_asc",
  precio_desc: "precio_desc",
} as const;

export type SortOption = keyof typeof SORT_OPTIONS;

// `cost` is admin-only and deliberately excluded here — every public-facing
// page and client component gets this type, so it must never carry cost.
export type ProductWithAvailability = Omit<Product, "cost"> & {
  availableUnits: number;
  effectivePrice: number;
  activePromotion: ActivePromotion | null;
};

export function parseSort(value: string | string[] | undefined): SortOption {
  if (typeof value === "string" && value in SORT_OPTIONS) {
    return value as SortOption;
  }
  return "nuevo";
}

function sortProducts(
  products: ProductWithAvailability[],
  sort: SortOption,
): ProductWithAvailability[] {
  const sorted = [...products];
  switch (sort) {
    case "az":
      return sorted.sort((a, b) => a.album.localeCompare(b.album, "es"));
    case "precio_asc":
      return sorted.sort((a, b) => a.effectivePrice - b.effectivePrice);
    case "precio_desc":
      return sorted.sort((a, b) => b.effectivePrice - a.effectivePrice);
    case "nuevo":
    default:
      return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

const PRODUCTS_CACHE_TAG = "products";

/** Llamar después de cualquier cambio que afecte disponibilidad/precio del catálogo: alta,
 * edición o borrado de producto, promociones, y pedidos (crear uno reserva unidades; rechazar
 * uno las libera). Sin esto, el catálogo cacheado se queda mostrando stock/precio viejo.
 * `updateTag` expira de inmediato (en vez de servir stale-while-revalidate) y solo puede
 * llamarse desde Server Actions — que es justo donde viven todas estas mutaciones. */
export function invalidateProductsCache() {
  updateTag(PRODUCTS_CACHE_TAG);
}

async function reservedByProductMap(): Promise<Map<string, number>> {
  const rows = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { order: { status: { not: "RECHAZADO" } } },
    _sum: { quantity: true },
  });
  return new Map(rows.map((row) => [row.productId, row._sum.quantity ?? 0]));
}

/** Trae todos los productos del catálogo (no personalizados) con disponibilidad y precio con
 * descuento si aplica. Las unidades reservadas se agregan en SQL (groupBy) en vez de traer cada
 * order item histórico a JS: con miles de pedidos acumulados, incluir esas filas por producto
 * crecía sin límite y se volvía la parte más pesada de cada carga del catálogo. Envuelta en
 * unstable_cache porque antes se re-ejecutaba en cada visita (las páginas de catálogo eran
 * force-dynamic) — ver invalidateProductsCache para cuándo se refresca. */
const getProductsWithAvailability = unstable_cache(
  async (): Promise<ProductWithAvailability[]> => {
    const [products, reserved, promotions] = await Promise.all([
      prisma.product.findMany({ where: { isCustom: false } }),
      reservedByProductMap(),
      getActivePromotionsMap(),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured out to strip admin-only cost
    return products.map(({ cost: _cost, ...product }) => {
      const activePromotion = promotions.get(product.id) ?? null;
      return {
        ...product,
        availableUnits: Math.max(0, product.units - (reserved.get(product.id) ?? 0)),
        effectivePrice: applyDiscount(Number(product.price), activePromotion),
        activePromotion,
      };
    });
  },
  ["products-with-availability"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 },
);

export async function getAvailableProducts(
  sort: SortOption = "nuevo",
  search?: string,
): Promise<ProductWithAvailability[]> {
  let products = (await getProductsWithAvailability()).filter(
    (p) => p.availableUnits > 0,
  );

  const q = search?.trim().toLowerCase();
  if (q) {
    products = products.filter(
      (p) =>
        p.artist.toLowerCase().includes(q) || p.album.toLowerCase().includes(q),
    );
  }

  return sortProducts(products, sort);
}

export const getProductById = unstable_cache(
  async (id: string): Promise<ProductWithAvailability | null> => {
    const [product, reservedAgg, activePromotion] = await Promise.all([
      prisma.product.findUnique({ where: { id } }),
      prisma.orderItem.aggregate({
        where: { productId: id, order: { status: { not: "RECHAZADO" } } },
        _sum: { quantity: true },
      }),
      getActivePromotionForProduct(id),
    ]);
    if (!product) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured out to strip admin-only cost
    const { cost: _cost, ...rest } = product;
    const reserved = reservedAgg._sum.quantity ?? 0;
    return {
      ...rest,
      availableUnits: Math.max(0, product.units - reserved),
      effectivePrice: applyDiscount(Number(product.price), activePromotion),
      activePromotion,
    };
  },
  ["product-by-id"],
  { tags: [PRODUCTS_CACHE_TAG], revalidate: 60 },
);

/** Trae varios productos por id (para armar el resumen del carrito) sin filtrar por disponibilidad.
 * Consulta solo esos ids en vez de traer todo el catálogo — el carrito nunca trae más de un puñado. */
export async function getProductsByIds(
  ids: string[],
): Promise<ProductWithAvailability[]> {
  if (ids.length === 0) return [];

  const [products, reservedRows, promotions] = await Promise.all([
    prisma.product.findMany({ where: { id: { in: ids }, isCustom: false } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { in: ids }, order: { status: { not: "RECHAZADO" } } },
      _sum: { quantity: true },
    }),
    getActivePromotionsMap(),
  ]);

  const reservedByProduct = new Map(reservedRows.map((row) => [row.productId, row._sum.quantity ?? 0]));
  const byId = new Map(
    products.map(({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured out to strip admin-only cost
      cost: _cost,
      ...product
    }) => {
      const activePromotion = promotions.get(product.id) ?? null;
      const withAvailability: ProductWithAvailability = {
        ...product,
        availableUnits: Math.max(0, product.units - (reservedByProduct.get(product.id) ?? 0)),
        effectivePrice: applyDiscount(Number(product.price), activePromotion),
        activePromotion,
      };
      return [product.id, withAvailability] as const;
    }),
  );

  return ids.map((id) => byId.get(id)).filter((p): p is ProductWithAvailability => Boolean(p));
}

export async function getAllProductsForAdmin(): Promise<ProductWithAvailability[]> {
  const products = await getProductsWithAvailability();
  return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Admin-only: el costo nunca viaja con ProductWithAvailability, así que se trae aparte. */
export async function getProductCost(id: string): Promise<number | null> {
  const product = await prisma.product.findUnique({ where: { id }, select: { cost: true } });
  return product?.cost != null ? Number(product.cost) : null;
}

export type SlowMover = {
  id: string;
  artist: string;
  album: string;
  imageUrl: string;
  daysInInventory: number;
};

/** Vinilos reales (no personalizados) todavía en inventario, del más antiguo al más nuevo. */
export async function getSlowMovers(limit = 3): Promise<SlowMover[]> {
  const products = await getProductsWithAvailability();
  const now = Date.now();
  return products
    .filter((p) => p.availableUnits > 0)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      artist: p.artist,
      album: p.album,
      imageUrl: p.imageUrl,
      daysInInventory: Math.floor((now - p.createdAt.getTime()) / 86_400_000),
    }));
}

export async function createProduct(data: ProductInput & { imageUrl: string }) {
  const sku = await resolveSkuForNewProduct(data.artist, data.album);
  const product = await prisma.product.create({ data: { ...data, sku } });
  await recordPriceIfNeeded(sku, data.price, product.id);
  return product;
}

export async function updateProduct(
  id: string,
  data: Omit<ProductInput, "cost"> & { imageUrl?: string; cost?: number | null },
) {
  // El SKU no se edita aquí: queda fijo al producto desde que se creó.
  const product = await prisma.product.update({ where: { id }, data });
  await recordPriceIfNeeded(product.sku, data.price, product.id);
  return product;
}

export async function deleteProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  await prisma.product.delete({ where: { id } });
  await deleteProductImage(product.imageUrl).catch(() => {});
}

/** Crea un producto "de una sola vez" para un pedido personalizado: no entra al catálogo ni al seguimiento de SKU. */
export async function createCustomProduct(data: {
  artist: string;
  album: string;
  price: number;
  imageUrl: string;
}) {
  return prisma.product.create({
    data: { ...data, sku: "CUSTOM", units: 1, isCustom: true },
  });
}

export async function getProductAnalytics() {
  const [totalProductos, unidadesTotales, porMes] = await Promise.all([
    prisma.product.count({ where: { isCustom: false } }),
    prisma.product.aggregate({ where: { isCustom: false }, _sum: { units: true } }),
    prisma.$queryRaw<{ mes: Date; cantidad: bigint }[]>`
      SELECT date_trunc('month', "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Guatemala') AS mes,
             COUNT(*) AS cantidad
      FROM "Product"
      WHERE "isCustom" = false
      GROUP BY mes
      ORDER BY mes ASC
    `,
  ]);

  const products = await getProductsWithAvailability();
  const unidadesDisponibles = products.reduce((sum, p) => sum + p.availableUnits, 0);

  return {
    totalProductos,
    unidadesTotales: unidadesTotales._sum.units ?? 0,
    unidadesDisponibles,
    porMes: porMes.map((row) => ({
      mes: row.mes,
      cantidad: Number(row.cantidad),
    })),
  };
}
