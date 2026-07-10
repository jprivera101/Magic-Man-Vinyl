"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { SortOption } from "@/lib/products";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "nuevo", label: "Más nuevo primero" },
  { value: "az", label: "A - Z" },
  { value: "precio_asc", label: "Precio: menor a mayor" },
  { value: "precio_desc", label: "Precio: mayor a menor" },
];

export function SortSelect({ current }: { current: SortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm font-medium text-deep-grove">
      <span className="hidden sm:inline">Ordenar por</span>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-xl border border-deep-grove/20 bg-white px-3 py-2.5 text-sm font-medium text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust sm:w-auto"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
