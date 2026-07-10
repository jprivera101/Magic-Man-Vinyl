import "server-only";
import { prisma } from "@/lib/prisma";
import type { Promotion } from "@/generated/prisma/client";

export type ActivePromotion = {
  id: string;
  percent: number;
  endsAt: Date;
};

/** Todas las promociones activas ahora mismo, indexadas por producto (una por producto: la más reciente). */
export async function getActivePromotionsMap(): Promise<Map<string, ActivePromotion>> {
  const now = new Date();
  const promos = await prisma.promotion.findMany({
    where: { startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<string, ActivePromotion>();
  for (const promo of promos) {
    if (!map.has(promo.productId)) {
      map.set(promo.productId, { id: promo.id, percent: promo.percent, endsAt: promo.endsAt });
    }
  }
  return map;
}

export async function getActivePromotionForProduct(
  productId: string,
): Promise<ActivePromotion | null> {
  const now = new Date();
  const promo = await prisma.promotion.findFirst({
    where: { productId, startsAt: { lte: now }, endsAt: { gte: now } },
    orderBy: { createdAt: "desc" },
  });
  return promo ? { id: promo.id, percent: promo.percent, endsAt: promo.endsAt } : null;
}

export function daysUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}

export function applyDiscount(price: number, promo: ActivePromotion | Promotion | null): number {
  if (!promo) return price;
  const discounted = price * (1 - promo.percent / 100);
  return Math.round(discounted * 100) / 100;
}

export async function createPromotion(productId: string, percent: number, days: number) {
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + days * 24 * 60 * 60 * 1000);
  return prisma.promotion.create({ data: { productId, percent, startsAt, endsAt } });
}

export async function endPromotion(promotionId: string) {
  return prisma.promotion.update({
    where: { id: promotionId },
    data: { endsAt: new Date() },
  });
}
