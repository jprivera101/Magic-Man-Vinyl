"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { getCartProductsAction, type CartProduct } from "../cart-actions";
import { formatQuetzales } from "@/lib/format";

export function CarritoView() {
  const { items, setQuantity, removeItem } = useCart();
  const [products, setProducts] = useState<CartProduct[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCartProductsAction(items.map((i) => i.productId)).then((result) => {
      if (cancelled) return;
      setProducts(result);

      const removed = items.filter((i) => !result.some((p) => p.id === i.productId));
      const clamped = items.filter((i) => {
        const p = result.find((p) => p.id === i.productId);
        return p && i.quantity > p.availableUnits;
      });

      if (removed.length > 0) {
        removed.forEach((i) => removeItem(i.productId));
      }
      if (clamped.length > 0) {
        clamped.forEach((i) => {
          const p = result.find((p) => p.id === i.productId);
          if (p) setQuantity(i.productId, p.availableUnits);
        });
      }
      if (removed.length > 0 || clamped.length > 0) {
        setNotice(
          "Algunos discos de tu carrito ya no tenían suficiente stock y los ajustamos.",
        );
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (products === null) {
    return <p className="py-16 text-center text-sm text-deep-grove/50">Cargando carrito...</p>;
  }

  const lines = items
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? { ...line, product } : null;
    })
    .filter((l): l is { productId: string; quantity: number; product: CartProduct } => Boolean(l));

  const total = lines.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/60 py-20 text-center text-deep-grove/60">
        <ShoppingBag size={40} />
        <p>Tu carrito está vacío.</p>
        <Link
          href="/catalogo"
          className="mt-2 rounded-full bg-retro-rust px-6 py-3 font-semibold text-vintage-cream shadow-sm transition hover:bg-retro-rust-dark"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-32">
      {notice && (
        <p className="rounded-xl bg-golden-hour/10 px-4 py-3 text-sm text-deep-grove">
          {notice}
        </p>
      )}

      {lines.map(({ productId, quantity, product }) => (
        <div
          key={productId}
          className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-deep-grove/10"
        >
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
            <Image src={product.imageUrl} alt={product.album} fill className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs uppercase text-deep-grove/50">{product.artist}</p>
            <p className="truncate font-display font-semibold text-deep-grove">
              {product.album}
            </p>
            <p className="text-sm font-medium text-retro-rust">
              {formatQuetzales(product.price)}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 rounded-full border border-deep-grove/20 bg-white px-2 py-1.5">
            <button
              type="button"
              onClick={() => setQuantity(productId, quantity - 1)}
              aria-label="Menos"
              className="text-deep-grove/60"
            >
              <Minus size={14} />
            </button>
            <span className="w-4 text-center text-sm font-semibold text-deep-grove">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(productId, quantity + 1)}
              disabled={quantity >= product.availableUnits}
              aria-label="Más"
              className="text-deep-grove/60 disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeItem(productId)}
            aria-label={`Quitar ${product.album}`}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-deep-grove/40 transition hover:bg-retro-rust/10 hover:text-retro-rust-dark"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-deep-grove/10 bg-vintage-cream/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-deep-grove/60">Total</p>
            <p className="font-display text-xl font-bold text-retro-rust">
              {formatQuetzales(total)}
            </p>
          </div>
          <Link
            href="/pedido"
            className="font-display flex items-center justify-center rounded-full bg-retro-rust px-8 py-4 text-lg font-bold text-vintage-cream shadow-md transition hover:bg-retro-rust-dark active:scale-95"
          >
            Continuar
          </Link>
        </div>
      </div>
    </div>
  );
}
