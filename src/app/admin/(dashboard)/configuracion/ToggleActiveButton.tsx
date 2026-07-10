"use client";

import { useTransition } from "react";
import { toggleBankAccountActiveAction } from "./actions";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => toggleBankAccountActiveAction(id, !active))}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
        active
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-deep-grove/10 text-deep-grove/50 hover:bg-deep-grove/15"
      }`}
    >
      {active ? "Activa" : "Inactiva"}
    </button>
  );
}
