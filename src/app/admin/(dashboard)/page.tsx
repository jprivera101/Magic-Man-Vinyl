import Link from "next/link";
import { Disc3, PackageCheck, Archive, Clock, Wallet, Mic2, Users, BellRing } from "lucide-react";
import { getProductAnalytics } from "@/lib/products";
import { getOrderStats, getPendingOrderCounts } from "@/lib/orders";
import { getTopArtists, getTopClients } from "@/lib/analytics";
import { formatQuetzales } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { ProductsPerMonthChart } from "@/components/admin/ProductsPerMonthChart";
import { RankedList } from "@/components/admin/RankedList";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productStats, orderStats, pendingCounts, topArtists, topClients] = await Promise.all([
    getProductAnalytics(),
    getOrderStats(),
    getPendingOrderCounts(),
    getTopArtists(5),
    getTopClients(3),
  ]);

  const totalPendientes = pendingCounts.catalogo + pendingCounts.personalizado;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-deep-grove">Resumen</h1>

      {totalPendientes > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-retro-rust px-5 py-4 text-vintage-cream shadow-sm">
          <BellRing size={22} className="flex-shrink-0" />
          <p className="flex-1 text-sm font-semibold sm:text-base">
            Tienes {totalPendientes} pedido{totalPendientes === 1 ? "" : "s"} pendiente
            {totalPendientes === 1 ? "" : "s"} por revisar
          </p>
          <div className="flex gap-2">
            {pendingCounts.catalogo > 0 && (
              <Link
                href="/admin/pedidos?estado=PENDIENTE"
                className="rounded-full bg-vintage-cream px-4 py-2 text-xs font-semibold text-retro-rust-dark transition hover:bg-vintage-cream/90"
              >
                Pedidos ({pendingCounts.catalogo})
              </Link>
            )}
            {pendingCounts.personalizado > 0 && (
              <Link
                href="/admin/pedidos/personalizado?estado=PENDIENTE"
                className="rounded-full bg-vintage-cream px-4 py-2 text-xs font-semibold text-retro-rust-dark transition hover:bg-vintage-cream/90"
              >
                Personalizados ({pendingCounts.personalizado})
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Total productos"
          value={String(productStats.totalProductos)}
          icon={Disc3}
        />
        <StatCard
          label="Unidades disponibles"
          value={String(productStats.unidadesDisponibles)}
          icon={Archive}
        />
        <StatCard
          label="Vinilos vendidos"
          value={String(orderStats.vendidosUnidades)}
          icon={PackageCheck}
        />
        <StatCard
          label="Pedidos pendientes"
          value={String(orderStats.pendientes)}
          icon={Clock}
        />
        <StatCard
          label="Ventas totales"
          value={formatQuetzales(orderStats.totalVentas)}
          icon={Wallet}
        />
      </div>

      <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10 sm:p-6">
        <h2 className="font-display mb-2 text-lg font-semibold text-deep-grove">
          Vinilos agregados por mes
        </h2>
        <ProductsPerMonthChart data={productStats.porMes} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RankedList
          title="Artistas más vendidos"
          icon={Mic2}
          emptyText="Todavía no hay ventas confirmadas."
          items={topArtists.map((a) => ({
            label: a.artist,
            value: `${a.unidadesVendidas} vendido${a.unidadesVendidas === 1 ? "" : "s"}`,
          }))}
        />
        <RankedList
          title="Clientes más frecuentes"
          icon={Users}
          emptyText="Todavía no hay clientes recurrentes."
          items={topClients.map((c) => ({
            label: `${c.nombre} ${c.apellido}`,
            value: `${c.totalPedidos} pedido${c.totalPedidos === 1 ? "" : "s"}`,
          }))}
        />
      </div>
    </div>
  );
}
