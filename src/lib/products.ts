import "server-only";
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

export type ProductWithAvailability = Product & {
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

/** Trae todos los productos del catálogo (no personalizados) con disponibilidad y precio con descuento si aplica. */
async function getProductsWithAvailability(): Promise<ProductWithAvailability[]> {
  const [products, promotions] = await Promise.all([
    prisma.product.findMany({
      where: { isCustom: false },
      include: {
        orderItems: {
          where: { order: { status: { not: "RECHAZADO" } } },
          select: { quantity: true },
        },
      },
    }),
    getActivePromotionsMap(),
  ]);

  return products.map(({ orderItems, ...product }) => {
    const activePromotion = promotions.get(product.id) ?? null;
    return {
      ...product,
      availableUnits: Math.max(
        0,
        product.units - orderItems.reduce((sum, item) => sum + item.quantity, 0),
      ),
      effectivePrice: applyDiscount(Number(product.price), activePromotion),
      activePromotion,
    };
  });
}

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

export async function getProductById(
  id: string,
): Promise<ProductWithAvailability | null> {
  const [product, activePromotion] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: {
          where: { order: { status: { not: "RECHAZADO" } } },
          select: { quantity: true },
        },
      },
    }),
    getActivePromotionForProduct(id),
  ]);
  if (!product) return null;
  const { orderItems, ...rest } = product;
  const reserved = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  return {
    ...rest,
    availableUnits: Math.max(0, product.units - reserved),
    effectivePrice: applyDiscount(Number(product.price), activePromotion),
    activePromotion,
  };
}

/** Trae varios productos por id (para armar el resumen del carrito) sin filtrar por disponibilidad. */
export async function getProductsByIds(
  ids: string[],
): Promise<ProductWithAvailability[]> {
  if (ids.length === 0) return [];
  const products = await getProductsWithAvailability();
  const byId = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is ProductWithAvailability => Boolean(p));
}

export async function getAllProductsForAdmin(): Promise<ProductWithAvailability[]> {
  const products = await getProductsWithAvailability();
  return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createProduct(data: ProductInput & { imageUrl: string }) {
  const sku = await resolveSkuForNewProduct(data.artist, data.album);
  const product = await prisma.product.create({ data: { ...data, sku } });
  await recordPriceIfNeeded(sku, data.price, product.id);
  return product;
}

export async function updateProduct(
  id: string,
  data: ProductInput & { imageUrl?: string },
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
      SELECT date_trunc('month', "createdAt") AS mes, COUNT(*) AS cantidad
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
