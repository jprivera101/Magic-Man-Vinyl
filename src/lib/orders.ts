import "server-only";
import { prisma } from "@/lib/prisma";
import { getDepositSignedUrl } from "@/lib/storage";
import { getActivePromotionForProduct, applyDiscount } from "@/lib/promotions";
import type { OrderInput, CartItemInput } from "@/lib/validation";
import type { $Enums } from "@/generated/prisma/client";

export class OrderError extends Error {}

function randomDigits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/** Código de orden: primera letra del nombre + primera del apellido + dígitos al azar (5, y sube a 6+ si ese rango ya se agotó). */
export async function generateOrderCode(
  tx: Tx,
  nombre: string,
  apellido: string,
): Promise<string> {
  const prefix = (nombre[0] + apellido[0]).toUpperCase();
  let digits = 5;
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = `${prefix}${randomDigits(digits)}`;
    const exists = await tx.order.findUnique({ where: { codigo: candidate } });
    if (!exists) return candidate;
    if (attempt > 0 && attempt % 25 === 24) digits++;
  }
  // Extremadamente improbable, pero garantiza que siempre termine con algo único.
  return `${prefix}${Date.now()}`;
}

function normalize(value: string) {
  return value.trim();
}

/** Busca (por nombre+apellido y teléfono/correo) si ya tenemos una dirección guardada para este cliente. */
export async function lookupClientAddress(
  nombre: string,
  apellido: string,
  telefono?: string,
  email?: string,
) {
  if (!telefono && !email) return null;

  const contactFilters = [];
  if (telefono) contactFilters.push({ telefono });
  if (email) contactFilters.push({ email: { equals: normalize(email), mode: "insensitive" as const } });

  const client = await prisma.client.findFirst({
    where: {
      nombre: { equals: normalize(nombre), mode: "insensitive" },
      apellido: { equals: normalize(apellido), mode: "insensitive" },
      OR: contactFilters,
    },
    orderBy: { updatedAt: "desc" },
  });

  return client ? { direccion: client.direccion } : null;
}

async function upsertClient(
  tx: Tx,
  data: { nombre: string; apellido: string; telefono?: string; email?: string; direccion: string },
) {
  const contactFilters = [];
  if (data.telefono) contactFilters.push({ telefono: data.telefono });
  if (data.email) {
    contactFilters.push({ email: { equals: normalize(data.email), mode: "insensitive" as const } });
  }

  const existing = contactFilters.length
    ? await tx.client.findFirst({
        where: {
          nombre: { equals: normalize(data.nombre), mode: "insensitive" },
          apellido: { equals: normalize(data.apellido), mode: "insensitive" },
          OR: contactFilters,
        },
      })
    : null;

  if (existing) {
    return tx.client.update({
      where: { id: existing.id },
      data: {
        telefono: data.telefono ?? existing.telefono,
        email: data.email ?? existing.email,
        direccion: data.direccion,
      },
    });
  }

  return tx.client.create({ data });
}

const ORDER_INCLUDE = { items: { include: { product: true } } } as const;

export async function createOrder(
  data: OrderInput & { depositoPath: string; items: CartItemInput[] },
) {
  const { items, depositoPath, bankAccountId, ...customer } = data;

  return prisma.$transaction(async (tx) => {
    const bankAccount = bankAccountId
      ? await tx.bankAccount.findUnique({ where: { id: bankAccountId } })
      : null;
    for (const item of items) {
      const locked = await tx.$queryRaw<{ id: string; artist: string; album: string; units: number; price: string }[]>`
        SELECT id, artist, album, units, price FROM "Product" WHERE id = ${item.productId} FOR UPDATE
      `;
      const product = locked[0];
      if (!product) {
        throw new OrderError("Uno de los vinilos del carrito ya no existe.");
      }

      const existingQty = await tx.orderItem.aggregate({
        where: { productId: item.productId, order: { status: { not: "RECHAZADO" } } },
        _sum: { quantity: true },
      });
      const reserved = existingQty._sum.quantity ?? 0;

      if (reserved + item.quantity > product.units) {
        throw new OrderError(
          `Ya no hay suficientes unidades de "${product.album}" disponibles.`,
        );
      }
    }

    const codigo = await generateOrderCode(tx, customer.nombre, customer.apellido);
    const client = await upsertClient(tx, customer);

    const order = await tx.order.create({
      data: {
        ...customer,
        depositoPath,
        codigo,
        clientId: client.id,
        depositoBanco: bankAccount?.banco,
        depositoNumeroCuenta: bankAccount?.numeroCuenta,
        depositoTipoCuenta: bankAccount?.tipoCuenta,
        depositoTitular: bankAccount?.titular,
      },
    });

    for (const item of items) {
      const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId } });
      const promo = await getActivePromotionForProduct(item.productId);
      const price = applyDiscount(Number(product.price), promo);
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price,
        },
      });
    }

    return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: ORDER_INCLUDE });
  });
}

export async function getOrders(status?: $Enums.OrderStatus) {
  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      items: { none: { product: { isCustom: true } } },
    },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

/** Pedidos personalizados (por encargo) — se administran aparte porque siguen su propio flujo de estados. */
export async function getCustomOrders(status?: $Enums.OrderStatus) {
  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      items: { some: { product: { isCustom: true } } },
    },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
}

/** Confirmación pública inmediatamente después de crear el pedido (solo necesita el código). */
export async function getOrderByCodigoPublic(codigo: string) {
  return prisma.order.findUnique({
    where: { codigo: codigo.trim().toUpperCase() },
    include: ORDER_INCLUDE,
  });
}

export async function getOrderById(id: number) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: ORDER_INCLUDE,
  });
  if (!order) return null;

  const depositoUrl = order.depositoPath
    ? await getDepositSignedUrl(order.depositoPath)
    : null;
  return { ...order, depositoUrl };
}

/** Pedido personalizado creado por el admin: sin comprobante ni control de stock, un producto de "una sola vez" por cada vinilo. */
export async function createCustomOrder(data: {
  nombre: string;
  apellido: string;
  telefono: string;
  email?: string;
  direccion: string;
  items: { artist: string; album: string; price: number; imageUrl: string }[];
}) {
  const { items, ...customer } = data;

  return prisma.$transaction(async (tx) => {
    const codigo = await generateOrderCode(tx, customer.nombre, customer.apellido);
    const client = await upsertClient(tx, customer);

    const order = await tx.order.create({
      data: { ...customer, codigo, clientId: client.id },
    });

    for (const item of items) {
      const product = await tx.product.create({
        data: {
          artist: item.artist,
          album: item.album,
          price: item.price,
          imageUrl: item.imageUrl,
          sku: "CUSTOM",
          units: 1,
          isCustom: true,
        },
      });
      await tx.orderItem.create({
        data: { orderId: order.id, productId: product.id, quantity: 1, price: item.price },
      });
    }

    return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: ORDER_INCLUDE });
  });
}

/** Edición limitada de un pedido personalizado: solo dirección y precio por vinilo. */
export async function updateCustomOrderDetails(
  orderId: number,
  data: { direccion: string; items: { id: string; price: number }[] },
) {
  return prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { direccion: data.direccion } });
    for (const item of data.items) {
      await tx.orderItem.updateMany({
        where: { id: item.id, orderId },
        data: { price: item.price },
      });
    }
    return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: ORDER_INCLUDE });
  });
}

export async function updateOrderStatus(
  id: number,
  status: $Enums.OrderStatus,
  rejectionReason?: string,
) {
  // Rejecting simply flips the order to RECHAZADO — availability is always
  // computed from non-rejected orders, so the units free up automatically.
  return prisma.order.update({
    where: { id },
    data: {
      status,
      rejectionReason: status === "RECHAZADO" ? (rejectionReason ?? null) : null,
    },
    include: ORDER_INCLUDE,
  });
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

/** Busca un pedido público por código de orden + teléfono o correo (sin exponer datos si no coinciden). */
export async function trackOrder(codigo: string, contacto: string) {
  const order = await prisma.order.findUnique({
    where: { codigo: codigo.trim().toUpperCase() },
    include: ORDER_INCLUDE,
  });
  if (!order) return null;

  const input = contacto.trim().toLowerCase();
  const matchesPhone =
    Boolean(order.telefono) &&
    normalizePhone(contacto).length > 0 &&
    normalizePhone(contacto) === normalizePhone(order.telefono!);
  const matchesEmail = Boolean(order.email) && order.email!.toLowerCase() === input;

  if (!matchesPhone && !matchesEmail) return null;
  return order;
}

export async function getOrderStats() {
  const [pendientes, confirmados, enviados, rechazados] = await Promise.all([
    prisma.order.count({ where: { status: "PENDIENTE" } }),
    prisma.order.count({ where: { status: "CONFIRMADO" } }),
    prisma.order.count({ where: { status: "ENVIADO" } }),
    prisma.order.count({ where: { status: "RECHAZADO" } }),
  ]);

  const ventas = await prisma.orderItem.findMany({
    where: { order: { status: { in: ["CONFIRMADO", "ENVIADO"] } } },
  });

  const totalVentas = ventas.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  return { pendientes, confirmados, enviados, rechazados, totalVentas };
}
