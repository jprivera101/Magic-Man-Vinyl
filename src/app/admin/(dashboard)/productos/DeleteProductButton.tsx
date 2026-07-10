"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProductAction } from "./actions";

export function DeleteProductButton({ id, album }: { id: string; album: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm(`¿Eliminar "${album}"? Esta acción no se puede deshacer.`)) {
          startTransition(() => {
            deleteProductAction(id);
          });
        }
      }}
      className="flex h-9 w-9 items-center justify-center rounded-full text-deep-grove/50 transition hover:bg-retro-rust/10 hover:text-retro-rust-dark disabled:opacity-50"
      aria-label={`Eliminar ${album}`}
    >
      <Trash2 size={16} />
    </button>
  );
}
