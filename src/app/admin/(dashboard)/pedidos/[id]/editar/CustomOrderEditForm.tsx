"use client";

import { useActionState } from "react";
import Image from "next/image";
import { SubmitButton } from "@/components/SubmitButton";
import type { CustomOrderEditFormState } from "./actions";

const initialState: CustomOrderEditFormState = {};

type EditableItem = {
  id: string;
  price: string;
  artist: string;
  album: string;
  imageUrl: string;
};

export function CustomOrderEditForm({
  action,
  direccion,
  items,
}: {
  action: (prevState: CustomOrderEditFormState, formData: FormData) => Promise<CustomOrderEditFormState>;
  direccion: string;
  items: EditableItem[];
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-deep-grove/10"
          >
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
              <Image src={item.imageUrl} alt={item.album} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs uppercase text-deep-grove/50">{item.artist}</p>
              <p className="truncate font-display font-semibold text-deep-grove">{item.album}</p>
            </div>
            <label className="w-28 flex-shrink-0">
              <span className="mb-1 block text-xs font-semibold text-deep-grove/60">
                Precio (Q)
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                name={`price-${item.id}`}
                defaultValue={item.price}
                className="w-full rounded-lg border border-deep-grove/20 bg-white px-3 py-2 text-sm text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
              />
            </label>
          </div>
        ))}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
          Dirección de envío
        </span>
        <textarea
          name="direccion"
          required
          rows={3}
          defaultValue={direccion}
          className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
        />
      </label>

      {state.error && (
        <p className="rounded-xl bg-retro-rust/10 px-4 py-3 text-sm font-medium text-retro-rust-dark">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Guardando...">Guardar cambios</SubmitButton>
    </form>
  );
}
