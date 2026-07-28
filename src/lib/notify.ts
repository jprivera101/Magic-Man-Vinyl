import "server-only";
import { Resend } from "resend";
import { formatQuetzales } from "@/lib/format";
import type { $Enums } from "@/generated/prisma/client";

type NotifiableOrder = {
  codigo: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  email: string | null;
  direccion: string;
  status: $Enums.OrderStatus;
  items: { quantity: number; price: unknown; product: { artist: string; album: string } }[];
};

/** Best-effort email ping to the shop owner on every new order. Never throws — a notification failure must not block the customer's order. */
export async function notifyNewOrder(order: NotifiableOrder): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  try {
    const resend = new Resend(apiKey);
    const total = order.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const itemsList = order.items
      .map((i) => `${i.quantity} × ${i.product.artist} — ${i.product.album} (${formatQuetzales(Number(i.price))})`)
      .join("\n");

    await resend.emails.send({
      from: process.env.ORDER_NOTIFY_FROM ?? "Magic Man Vinyl <onboarding@resend.dev>",
      to,
      subject: `Nuevo pedido ${order.codigo} — ${formatQuetzales(total)}`,
      text: [
        `Cliente: ${order.nombre} ${order.apellido}`,
        order.telefono ? `Teléfono: ${order.telefono}` : null,
        order.email ? `Correo: ${order.email}` : null,
        `Dirección: ${order.direccion}`,
        "",
        itemsList,
        "",
        `Total: ${formatQuetzales(total)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("Failed to send order notification email", err);
  }
}
