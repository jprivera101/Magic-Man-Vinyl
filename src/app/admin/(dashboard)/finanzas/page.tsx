import Image from "next/image";
import { TrendingUp, Wallet, Clock3 } from "lucide-react";
import { getCurrentMonthSummary } from "@/lib/orders";
import { getSlowMovers } from "@/lib/products";
import { formatQuetzales } from "@/lib/format";
import { StatCard } from "@/components/admin/StatCard";
import { MonthlySalesChart } from "@/components/admin/MonthlySalesChart";

export const metadata = { title: "Finanzas | Admin" };
export const dynamic = "force-dynamic";

export default async function FinanzasPage() {
  const [summary, slowMovers] = await Promise.all([
    getCurrentMonthSummary(),
    getSlowMovers(3),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-bold text-deep-grove">Finanzas</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Ventas este mes"
          value={formatQuetzales(summary.esteMesVentas)}
          icon={TrendingUp}
        />
        <StatCard
          label="Ganancia este mes"
          value={formatQuetzales(summary.esteMesGanancia)}
          icon={Wallet}
        />
        <StatCard
          label="Ventas totales"
          value={formatQuetzales(summary.totalVentas)}
          icon={TrendingUp}
        />
        <StatCard
          label="Ganancia total"
          value={formatQuetzales(summary.totalGanancia)}
          icon={Wallet}
        />
      </div>

      <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-deep-grove">
          Ventas y ganancia por mes
        </h2>
        <p className="mb-2 text-xs text-deep-grove/50">
          La ganancia solo incluye vinilos con costo registrado — agrégalo al
          crear o editar cada vinilo para que el cálculo sea exacto.
        </p>
        <MonthlySalesChart data={summary.monthly} />
      </div>

      <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10 sm:p-6">
        <h2 className="font-display mb-3 flex items-center gap-2 text-lg font-semibold text-deep-grove">
          <Clock3 size={18} />
          Más tiempo en inventario
        </h2>
        {slowMovers.length === 0 ? (
          <p className="py-6 text-center text-sm text-deep-grove/50">
            No hay vinilos en inventario todavía.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {slowMovers.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-xl bg-deep-grove/5 px-3 py-2"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-golden-hour/20 text-xs font-bold text-golden-hour-dark">
                  {i + 1}
                </span>
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image src={p.imageUrl} alt={p.album} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs uppercase text-deep-grove/50">{p.artist}</p>
                  <p className="truncate text-sm font-semibold text-deep-grove">{p.album}</p>
                </div>
                <span className="flex-shrink-0 text-sm font-semibold text-retro-rust">
                  {p.daysInInventory} día{p.daysInInventory === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
