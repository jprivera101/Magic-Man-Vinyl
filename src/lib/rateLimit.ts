import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export class RateLimitError extends Error {}

/** Best-effort client IP from the proxy chain — good enough for abuse throttling, not for auth decisions. */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * Throws RateLimitError if `key` has already logged `max` events for `action`
 * within the trailing `windowMinutes`. Otherwise logs this attempt and lets it through.
 */
export async function enforceRateLimit(
  action: string,
  key: string,
  { max, windowMinutes }: { max: number; windowMinutes: number },
): Promise<void> {
  const since = new Date(Date.now() - windowMinutes * 60_000);
  const count = await prisma.rateLimitEvent.count({
    where: { action, key, createdAt: { gte: since } },
  });
  if (count >= max) {
    throw new RateLimitError("Demasiados intentos. Espera unos minutos e intenta de nuevo.");
  }
  await prisma.rateLimitEvent.create({ data: { action, key } });

  // Opportunistic cleanup so the table doesn't grow forever — no cron needed.
  if (Math.random() < 0.02) {
    await prisma.rateLimitEvent.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } },
    });
  }
}
