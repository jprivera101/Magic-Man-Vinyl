import "server-only";
import { prisma } from "@/lib/prisma";

export type TopArtist = { artist: string; unidadesVendidas: number };

/** Artistas con más unidades vendidas (pedidos confirmados o enviados). */
export async function getTopArtists(limit = 5): Promise<TopArtist[]> {
  const rows = await prisma.$queryRaw<{ artist: string; unidades: bigint }[]>`
    SELECT p.artist AS artist, SUM(oi.quantity) AS unidades
    FROM "OrderItem" oi
    JOIN "Product" p ON p.id = oi."productId"
    JOIN "Order" o ON o.id = oi."orderId"
    WHERE o.status IN ('CONFIRMADO', 'EN_TRANSITO', 'EN_GUATEMALA', 'ENVIADO', 'ENTREGADO')
    GROUP BY p.artist
    ORDER BY unidades DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ artist: r.artist, unidadesVendidas: Number(r.unidades) }));
}

export type TopClient = {
  clientId: string;
  nombre: string;
  apellido: string;
  totalPedidos: number;
};

/** Clientes con más pedidos confirmados o enviados (compradores más frecuentes). */
export async function getTopClients(limit = 3): Promise<TopClient[]> {
  const rows = await prisma.$queryRaw<
    { clientId: string; nombre: string; apellido: string; total: bigint }[]
  >`
    SELECT o."clientId" AS "clientId", c.nombre AS nombre, c.apellido AS apellido, COUNT(*) AS total
    FROM "Order" o
    JOIN "Client" c ON c.id = o."clientId"
    WHERE o."clientId" IS NOT NULL AND o.status IN ('CONFIRMADO', 'EN_TRANSITO', 'EN_GUATEMALA', 'ENVIADO', 'ENTREGADO')
    GROUP BY o."clientId", c.nombre, c.apellido
    ORDER BY total DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    clientId: r.clientId,
    nombre: r.nombre,
    apellido: r.apellido,
    totalPedidos: Number(r.total),
  }));
}
