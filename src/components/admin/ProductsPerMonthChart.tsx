"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RETRO_RUST = "#c24e2a";
const DEEP_GROVE_MUTED = "#1e2a2299";

type MonthPoint = { mes: Date; cantidad: number };

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("es-GT", {
    month: "short",
    year: "2-digit",
  }).format(new Date(date));
}

export function ProductsPerMonthChart({ data }: { data: MonthPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-deep-grove/50">
        Todavía no hay suficientes datos para mostrar esta gráfica.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    mesLabel: formatMonth(d.mes),
    cantidad: d.cantidad,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#1e2a221a" />
        <XAxis
          dataKey="mesLabel"
          tickLine={false}
          axisLine={false}
          tick={{ fill: DEEP_GROVE_MUTED, fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: DEEP_GROVE_MUTED, fontSize: 12 }}
          width={28}
        />
        <Tooltip
          cursor={{ fill: "#1e2a220d" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #1e2a221a",
            fontSize: 13,
          }}
          formatter={(value) => [String(value), "Vinilos agregados"]}
        />
        <Bar dataKey="cantidad" fill={RETRO_RUST} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
