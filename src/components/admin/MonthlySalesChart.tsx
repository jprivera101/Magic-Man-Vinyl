"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatQuetzales } from "@/lib/format";

const RETRO_RUST = "#c24e2a";
const GOLDEN_HOUR = "#a9791f";
const DEEP_GROVE_MUTED = "#1e2a2299";

type MonthPoint = { mes: Date; ventas: number; ganancia: number };

const MESES_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// `date` already represents the Guatemala calendar month (truncated in SQL),
// labeled as UTC — so its UTC getters are read directly, with no further
// timezone conversion (that would shift it by another 6 hours).
function formatMonth(date: Date) {
  const d = new Date(date);
  return `${MESES_ES[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(-2)}`;
}

const SERIES_LABELS: Record<string, string> = {
  ventas: "Ventas",
  ganancia: "Ganancia",
};

export function MonthlySalesChart({ data }: { data: MonthPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-deep-grove/50">
        Todavía no hay ventas registradas.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    mesLabel: formatMonth(d.mes),
    ventas: d.ventas,
    ganancia: d.ganancia,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#1e2a221a" />
        <XAxis
          dataKey="mesLabel"
          tickLine={false}
          axisLine={false}
          tick={{ fill: DEEP_GROVE_MUTED, fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: DEEP_GROVE_MUTED, fontSize: 12 }}
          width={60}
          tickFormatter={(value) => `Q${value}`}
        />
        <Tooltip
          cursor={{ fill: "#1e2a220d" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #1e2a221a",
            fontSize: 13,
          }}
          formatter={(value, name) => [
            formatQuetzales(Number(value)),
            SERIES_LABELS[String(name)] ?? String(name),
          ]}
        />
        <Legend
          formatter={(value) => SERIES_LABELS[value] ?? value}
          wrapperStyle={{ fontSize: 12.5, color: DEEP_GROVE_MUTED }}
        />
        <Bar dataKey="ventas" fill={RETRO_RUST} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="ganancia" fill={GOLDEN_HOUR} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
