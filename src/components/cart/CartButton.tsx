"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartButton() {
  const { totalCount } = useCart();

  return (
    <Link
      href="/carrito"
      aria-label="Ver carrito"
      className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-deep-grove transition hover:bg-deep-grove/10"
    >
      <ShoppingCart size={20} />
      {totalCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-retro-rust px-1 text-[10px] font-bold text-vintage-cream">
          {totalCount}
        </span>
      )}
    </Link>
  );
}
