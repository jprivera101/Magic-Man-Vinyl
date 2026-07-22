"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "./actions";
import type { $Enums } from "@/generated/prisma/client";

export function OrderStatusActions({
  id,
  status,
  isCustom = false,
}: {
  id: number;
  status: $Enums.OrderStatus;
  isCustom?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const router = useRouter();

  function apply(next: $Enums.OrderStatus, rejectionReason?: string) {
    startTransition(async () => {
      await updateOrderStatusAction(id, next, rejectionReason);
      router.refresh();
    });
  }

  function confirmReject() {
    if (!reason.trim()) return;
    apply("RECHAZADO", reason.trim());
  }

  if (status === "PENDIENTE") {
    if (rejecting) {
      return (
        <div className="flex flex-col gap-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
              ¿Por qué se rechaza este pedido?
            </span>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Ej. El comprobante no coincide con el monto del pedido"
              className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending || !reason.trim()}
              onClick={confirmReject}
              className="rounded-full bg-retro-rust px-4 py-2.5 text-sm font-semibold text-vintage-cream transition hover:bg-retro-rust-dark disabled:opacity-50"
            >
              Confirmar rechazo
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setRejecting(false);
                setReason("");
              }}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-deep-grove/60 transition hover:bg-deep-grove/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => apply("CONFIRMADO")}
          className="rounded-full bg-deep-grove px-4 py-2.5 text-sm font-semibold text-vintage-cream transition hover:bg-deep-grove-light disabled:opacity-50"
        >
          {isCustom ? "Confirmar pago parcial" : "Confirmar depósito"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setRejecting(true)}
          className="rounded-full bg-retro-rust/10 px-4 py-2.5 text-sm font-semibold text-retro-rust-dark transition hover:bg-retro-rust/20 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
    );
  }

  if (status === "CONFIRMADO") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => apply(isCustom ? "EN_TRANSITO" : "ENVIADO")}
          className="rounded-full bg-deep-grove px-4 py-2.5 text-sm font-semibold text-vintage-cream transition hover:bg-deep-grove-light disabled:opacity-50"
        >
          {isCustom ? "Marcar en tránsito" : "Marcar como enviado"}
        </button>
      </div>
    );
  }

  if (status === "EN_TRANSITO") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => apply("EN_GUATEMALA")}
          className="rounded-full bg-deep-grove px-4 py-2.5 text-sm font-semibold text-vintage-cream transition hover:bg-deep-grove-light disabled:opacity-50"
        >
          Marcar en Guatemala
        </button>
      </div>
    );
  }

  if (status === "EN_GUATEMALA") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => apply("ENVIADO")}
          className="rounded-full bg-deep-grove px-4 py-2.5 text-sm font-semibold text-vintage-cream transition hover:bg-deep-grove-light disabled:opacity-50"
        >
          Marcar como enviado
        </button>
      </div>
    );
  }

  if (status === "ENVIADO") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => apply("ENTREGADO")}
          className="rounded-full bg-deep-grove px-4 py-2.5 text-sm font-semibold text-vintage-cream transition hover:bg-deep-grove-light disabled:opacity-50"
        >
          Marcar como entregado
        </button>
      </div>
    );
  }

  return null;
}
