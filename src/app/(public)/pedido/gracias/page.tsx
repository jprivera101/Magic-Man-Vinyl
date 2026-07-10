import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByCodigoPublic } from "@/lib/orders";
import { OrderReceipt } from "./OrderReceipt";
import { ClearCartOnMount } from "./ClearCartOnMount";

export const dynamic = "force-dynamic";

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ orden?: string }>;
}) {
  const { orden } = await searchParams;
  if (!orden) notFound();

  const order = await getOrderByCodigoPublic(orden);
  if (!order) notFound();

  const total = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-10 text-center sm:py-14">
      <ClearCartOnMount />
      <OrderReceipt
        orderId={order.codigo}
        items={order.items.map((item) => ({
          artist: item.product.artist,
          album: item.product.album,
          price: item.price.toString(),
          imageUrl: item.product.imageUrl,
          quantity: item.quantity,
        }))}
        total={total}
      />

      <p className="mt-6 text-sm text-deep-grove/70">
        Vamos a verificar tu comprobante de depósito y te contactaremos al
        teléfono que nos dejaste para confirmar el envío.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/catalogo"
          className="inline-flex justify-center rounded-full bg-retro-rust px-6 py-3 font-semibold text-vintage-cream shadow-sm transition hover:bg-retro-rust-dark"
        >
          Seguir viendo el catálogo
        </Link>
        <Link
          href="/rastreo"
          className="inline-flex justify-center rounded-full border border-deep-grove/20 bg-white px-6 py-3 font-semibold text-deep-grove shadow-sm transition hover:border-retro-rust/50"
        >
          Rastrear mi pedido
        </Link>
      </div>
    </div>
  );
}
