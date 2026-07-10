"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Percent, X } from "lucide-react";
import { createPromotionAction, endPromotionAction } from "./actions";

export function PromotionButton({
  productId,
  activePromotion,
}: {
  productId: string;
  activePromotion: { id: string; percent: number; daysLeft: number } | null;
}) {
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(15);
  const [days, setDays] = useState(5);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setPending(true);
    await createPromotionAction(productId, percent, days);
    setPending(false);
    setOpen(false);
    router.refresh();
  }

  async function handleEnd() {
    if (!activePromotion) return;
    setPending(true);
    await endPromotionAction(activePromotion.id);
    setPending(false);
    router.refresh();
  }

  if (activePromotion) {
    return (
      <div className="flex flex-shrink-0 items-center gap-1">
        <span className="whitespace-nowrap rounded-full bg-retro-rust px-2 py-1 text-[11px] font-bold text-vintage-cream">
          -{activePromotion.percent}% · {activePromotion.daysLeft}d
        </span>
        <button
          type="button"
          onClick={handleEnd}
          disabled={pending}
          aria-label="Terminar promoción"
          className="flex h-7 w-7 items-center justify-center rounded-full text-deep-grove/40 transition hover:bg-retro-rust/10 hover:text-retro-rust-dark disabled:opacity-50"
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Crear promoción"
        className="flex h-9 w-9 items-center justify-center rounded-full text-deep-grove/50 transition hover:bg-golden-hour/20 hover:text-golden-hour-dark"
      >
        <Percent size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-30 w-56 rounded-xl bg-white p-3 shadow-lg ring-1 ring-deep-grove/10">
            <p className="mb-2 text-xs font-semibold text-deep-grove">Nueva promoción</p>
            <label className="mb-2 block text-xs text-deep-grove/60">
              % de descuento
              <input
                type="number"
                min={1}
                max={90}
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-deep-grove/20 px-2 py-1.5 text-sm text-deep-grove focus:border-retro-rust focus:outline-none"
              />
            </label>
            <label className="mb-3 block text-xs text-deep-grove/60">
              Duración (días)
              <input
                type="number"
                min={1}
                max={90}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-deep-grove/20 px-2 py-1.5 text-sm text-deep-grove focus:border-retro-rust focus:outline-none"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={pending}
                className="flex-1 rounded-full bg-retro-rust px-3 py-1.5 text-xs font-semibold text-vintage-cream transition hover:bg-retro-rust-dark disabled:opacity-50"
              >
                Crear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-deep-grove/60 transition hover:bg-deep-grove/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
