"use client";

import { useActionState } from "react";
import { trackOrderAction, type TrackFormState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { PackageSearch } from "lucide-react";

const initialState: TrackFormState = {};

export function TrackForm() {
  const [state, formAction] = useActionState(trackOrderAction, initialState);

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Código de orden
          </span>
          <input
            type="text"
            name="codigo"
            required
            placeholder="Ej. JP48213"
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base uppercase text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Teléfono o correo del pedido
          </span>
          <input
            type="text"
            name="contacto"
            required
            placeholder="El que usaste al hacer el pedido"
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          />
        </label>

        {state.error && (
          <p className="rounded-xl bg-retro-rust/10 px-4 py-3 text-sm font-medium text-retro-rust-dark">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Buscando...">Rastrear pedido</SubmitButton>
      </form>

      {state.result && (
        <div className="rounded-2xl border border-golden-hour/40 bg-golden-hour/10 p-4">
          <div className="flex items-start gap-3">
            <PackageSearch className="mt-0.5 flex-shrink-0 text-golden-hour-dark" size={22} />
            <div className="text-sm text-deep-grove">
              <p className="font-display text-base font-bold">
                Orden {state.result.codigo}
              </p>
              <div className="mt-1 flex flex-col gap-0.5">
                {state.result.items.map((item, i) => (
                  <p key={i}>
                    {item.quantity} × {item.artist} — {item.album} ({item.price})
                  </p>
                ))}
              </div>
              <p className="mt-1 font-semibold">Total: {state.result.total}</p>
              <div className="mt-2">
                <OrderStatusBadge status={state.result.statusRaw} label={state.result.status} />
              </div>
              {state.result.rejectionReason && (
                <p className="mt-1 text-retro-rust-dark">
                  Motivo: {state.result.rejectionReason}
                </p>
              )}
              <p className="mt-1 text-xs text-deep-grove/60">
                Pedido el {state.result.createdAt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
