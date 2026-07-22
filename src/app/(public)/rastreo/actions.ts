"use server";

import { trackOrderSchema } from "@/lib/validation";
import { trackOrder } from "@/lib/orders";
import { formatFechaHora, formatQuetzales } from "@/lib/format";
import type { $Enums } from "@/generated/prisma/client";

export type TrackResultItem = {
  artist: string;
  album: string;
  price: string;
  quantity: number;
};

export type TrackResult = {
  codigo: string;
  status: string;
  statusRaw: $Enums.OrderStatus;
  items: TrackResultItem[];
  total: string;
  createdAt: string;
  rejectionReason?: string;
  delivered?: boolean;
};

export type TrackFormState = { error?: string; result?: TrackResult };

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente de confirmación",
  CONFIRMADO: "Pago confirmado — preparando pedido",
  EN_TRANSITO: "En camino desde el extranjero",
  EN_GUATEMALA: "Llegó a Guatemala — preparando entrega",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  RECHAZADO: "Rechazado",
};

export async function trackOrderAction(
  prevState: TrackFormState,
  formData: FormData,
): Promise<TrackFormState> {
  const parsed = trackOrderSchema.safeParse({
    codigo: formData.get("codigo"),
    contacto: formData.get("contacto"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    };
  }

  const order = await trackOrder(parsed.data.codigo, parsed.data.contacto);

  if (!order) {
    return {
      error:
        "No encontramos un pedido con ese código y ese teléfono/correo. Verifica los datos.",
    };
  }

  if (order.status === "ENTREGADO") {
    return {
      result: {
        codigo: order.codigo,
        status: STATUS_LABELS.ENTREGADO,
        statusRaw: order.status,
        items: [],
        total: "",
        createdAt: formatFechaHora(order.createdAt),
        delivered: true,
      },
    };
  }

  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  return {
    result: {
      codigo: order.codigo,
      status: STATUS_LABELS[order.status] ?? order.status,
      statusRaw: order.status,
      items: order.items.map((item) => ({
        artist: item.product.artist,
        album: item.product.album,
        price: formatQuetzales(item.price.toString()),
        quantity: item.quantity,
      })),
      total: formatQuetzales(total),
      createdAt: formatFechaHora(order.createdAt),
      rejectionReason: order.rejectionReason ?? undefined,
    },
  };
}
