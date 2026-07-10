"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export function AddToCartBar({
  productId,
  availableUnits,
}: {
  productId: string;
  availableUnits: number;
}) {
  const { items, addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = items.find((l) => l.productId === productId)?.quantity ?? 0;
  const maxAddable = Math.max(0, availableUnits - inCart);

  if (availableUnits <= 0) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-deep-grove/10 bg-vintage-cream/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          <span className="flex w-full items-center justify-center rounded-full bg-deep-grove/15 px-6 py-4 text-lg font-bold text-deep-grove/50">
            Ya no está disponible
          </span>
        </div>
      </div>
    );
  }

  function handleAdd() {
    if (maxAddable <= 0) return;
    addItem(productId, qty);
    setJustAdded(true);
    setQty(1);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-deep-grove/10 bg-vintage-cream/95 p-4 backdrop-blur">
      <div className="mx-auto max-w-3xl">
        {justAdded ? (
          <div className="flex items-center justify-between gap-3 rounded-full bg-deep-grove/10 py-2 pl-4 pr-2">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-deep-grove">
              <Check size={16} />
              Agregado al carrito
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJustAdded(false)}
                className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-deep-grove shadow-sm"
              >
                Seguir viendo
              </button>
              <Link
                href="/carrito"
                className="rounded-full bg-retro-rust px-3 py-2 text-xs font-semibold text-vintage-cream shadow-sm"
              >
                Ver carrito
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 rounded-full border border-deep-grove/20 bg-white px-3 py-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Menos"
                className="text-deep-grove/60 disabled:opacity-30"
              >
                <Minus size={16} />
              </button>
              <span className="w-5 text-center font-semibold text-deep-grove">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxAddable, q + 1))}
                disabled={qty >= maxAddable}
                aria-label="Más"
                className="text-deep-grove/60 disabled:opacity-30"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={maxAddable <= 0}
              className="font-display flex flex-1 items-center justify-center gap-2 rounded-full bg-retro-rust px-6 py-4 text-lg font-bold text-vintage-cream shadow-md transition hover:bg-retro-rust-dark active:scale-95 disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {maxAddable <= 0 ? "Ya lo tienes todo en el carrito" : "Agregar al carrito"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
