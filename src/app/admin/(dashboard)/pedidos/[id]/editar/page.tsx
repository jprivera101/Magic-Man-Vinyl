import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderById } from "@/lib/orders";
import { CustomOrderEditForm } from "./CustomOrderEditForm";
import { updateCustomOrderAction } from "./actions";

export const metadata = { title: "Editar pedido | Admin" };
export const dynamic = "force-dynamic";

export default async function EditarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (Number.isNaN(orderId)) notFound();

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const isCustom = order.items.some((item) => item.product.isCustom);
  if (!isCustom) redirect(`/admin/pedidos/${orderId}`);

  const boundAction = updateCustomOrderAction.bind(null, orderId);

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/pedidos/${orderId}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-deep-grove/60 hover:text-deep-grove"
      >
        <ArrowLeft size={16} />
        Volver a la orden
      </Link>
      <h1 className="font-display mb-2 text-2xl font-bold text-deep-grove">
        Editar orden {order.codigo}
      </h1>
      <p className="mb-6 text-sm text-deep-grove/60">
        Solo puedes ajustar el precio de cada vinilo y la dirección de envío
        — el cliente, teléfono, correo, artista y álbum quedan fijos.
      </p>
      <CustomOrderEditForm
        action={boundAction}
        direccion={order.direccion}
        items={order.items.map((item) => ({
          id: item.id,
          price: item.price.toString(),
          artist: item.product.artist,
          album: item.product.album,
          imageUrl: item.product.imageUrl,
        }))}
      />
    </div>
  );
}
