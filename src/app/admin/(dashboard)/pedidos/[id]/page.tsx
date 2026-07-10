import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, MapPin } from "lucide-react";
import { getOrderById } from "@/lib/orders";
import { formatQuetzales, formatFechaHora } from "@/lib/format";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { OrderStatusActions } from "../OrderStatusActions";

export const dynamic = "force-dynamic";

export default async function PedidoDetallePage({
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

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/pedidos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-deep-grove/60 hover:text-deep-grove"
      >
        <ArrowLeft size={16} />
        Volver a pedidos
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-deep-grove">
          Orden {order.codigo}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-deep-grove/50">{formatFechaHora(order.createdAt)}</p>

      <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-deep-grove/10">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
              <Image
                src={item.product.imageUrl}
                alt={item.product.album}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs uppercase text-deep-grove/50">
                {item.product.artist}
              </p>
              <p className="truncate font-display font-semibold text-deep-grove">
                {item.product.album}
              </p>
              <p className="text-sm text-deep-grove/60">
                {item.quantity} × {formatQuetzales(item.price.toString())}
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-deep-grove/10 pt-2">
          <span className="text-sm font-semibold text-deep-grove">Total</span>
          <span className="font-display font-bold text-retro-rust">
            {formatQuetzales(
              order.items.reduce(
                (sum, item) => sum + Number(item.price) * item.quantity,
                0,
              ),
            )}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10">
        <h2 className="font-display mb-3 text-lg font-semibold text-deep-grove">
          Datos del cliente
        </h2>
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex items-center gap-2.5">
            <User size={16} className="text-deep-grove/40" />
            <dd className="text-deep-grove">
              {order.nombre} {order.apellido}
            </dd>
          </div>
          {order.telefono && (
            <div className="flex items-center gap-2.5">
              <Phone size={16} className="text-deep-grove/40" />
              <dd className="text-deep-grove">{order.telefono}</dd>
            </div>
          )}
          {order.email && (
            <div className="flex items-center gap-2.5">
              <Mail size={16} className="text-deep-grove/40" />
              <dd className="text-deep-grove">{order.email}</dd>
            </div>
          )}
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="mt-0.5 flex-shrink-0 text-deep-grove/40" />
            <dd className="text-deep-grove">{order.direccion}</dd>
          </div>
        </dl>
      </div>

      {order.depositoUrl ? (
        <div className="mt-6 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10">
          <h2 className="font-display mb-3 text-lg font-semibold text-deep-grove">
            Comprobante de depósito
          </h2>
          {order.depositoBanco && (
            <p className="mb-3 text-sm text-deep-grove/70">
              Depositó a: <span className="font-semibold text-deep-grove">{order.depositoBanco}</span>
              {order.depositoNumeroCuenta && ` · ${order.depositoNumeroCuenta}`}
            </p>
          )}
          <a
            href={order.depositoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-[3/4] max-w-sm overflow-hidden rounded-xl bg-deep-grove/5"
          >
            <Image
              src={order.depositoUrl}
              alt="Comprobante de depósito"
              fill
              unoptimized
              className="object-contain"
            />
          </a>
          <p className="mt-2 text-xs text-deep-grove/50">
            Toca la imagen para verla en tamaño completo.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-golden-hour/10 p-4 text-sm text-deep-grove">
          Pedido personalizado — sin comprobante de depósito.
        </div>
      )}

      {order.status === "RECHAZADO" && order.rejectionReason && (
        <div className="mt-6 rounded-2xl bg-retro-rust/10 p-4">
          <h2 className="font-display mb-1 text-sm font-semibold text-retro-rust-dark">
            Motivo del rechazo
          </h2>
          <p className="text-sm text-deep-grove">{order.rejectionReason}</p>
        </div>
      )}

      <div className="mt-6">
        <OrderStatusActions id={order.id} status={order.status} isCustom={isCustom} />
      </div>
    </div>
  );
}
