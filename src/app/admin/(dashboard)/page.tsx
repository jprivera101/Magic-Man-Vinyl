import { Disc3, PackageCheck, Archive, Clock, Wallet, Mic2, Users } from "lucide-react";
import { getProductAnalytics } from "@/lib/products";
import { getOrderStats } from "@/lib/orders";
import { getTopArtists, getTopClients } from "@/lib/analytics";
import { formatQuetzales } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { ProductsPerMonthChart } from "@/components/admin/ProductsPerMonthChart";
import { RankedList } from "@/components/admin/RankedList";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productStats, orderStats, topArtists, topClients] = await Promise.all([
    getProductAnalytics(),
    getOrderStats(),
    getTopArtists(5),
    getTopClients(3),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-deep-grove">Resumen</h1>

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
          label="Vendidos"
          value={String(orderStats.confirmados + orderStats.enviados)}
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
