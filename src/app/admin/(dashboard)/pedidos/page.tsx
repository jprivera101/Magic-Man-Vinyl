import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getOrders } from "@/lib/orders";
import { formatFechaHora } from "@/lib/format";
import { OrderStatusBadge } from "@/components/StatusBadge";
import type { $Enums } from "@/generated/prisma/client";

export const metadata = { title: "Pedidos | Admin" };
export const dynamic = "force-dynamic";

const TABS: { value: $Enums.OrderStatus | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "CONFIRMADO", label: "Confirmados" },
  { value: "ENVIADO", label: "Enviados" },
  { value: "RECHAZADO", label: "Rechazados" },
];

export default async function PedidosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const activeTab = TABS.some((t) => t.value === estado)
    ? (estado as $Enums.OrderStatus | "TODOS")
    : "TODOS";

  const orders = await getOrders(
    activeTab === "TODOS" ? undefined : activeTab,
  );

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-deep-grove">Pedidos</h1>
        <Link
          href="/admin/pedidos/personalizado"
          className="flex items-center gap-1.5 rounded-full bg-retro-rust px-4 py-2.5 text-sm font-semibold text-vintage-cream shadow-sm transition hover:bg-retro-rust-dark"
        >
          <Plus size={16} />
          Personalizado
        </Link>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-full bg-white/60 p-1">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "TODOS" ? "/admin/pedidos" : `/admin/pedidos?estado=${tab.value}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.value
                ? "bg-deep-grove text-vintage-cream"
                : "text-deep-grove/60 hover:bg-deep-grove/5"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="rounded-2xl bg-white/60 py-16 text-center text-deep-grove/60">
          No hay pedidos en esta categoría.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => {
            const firstItem = order.items[0];
            const extraCount = order.items.length - 1;
            return (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-deep-grove/10 transition hover:ring-deep-grove/25"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                  {firstItem && (
                    <Image
                      src={firstItem.product.imageUrl}
                      alt={firstItem.product.album}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-deep-grove/50">
                    Orden {order.codigo} · {formatFechaHora(order.createdAt)}
                  </p>
                  <p className="truncate font-display font-semibold text-deep-grove">
                    {firstItem?.product.album}
                    {extraCount > 0 && ` +${extraCount} más`}
                  </p>
                  <p className="truncate text-sm text-deep-grove/70">
                    {order.nombre} {order.apellido}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
