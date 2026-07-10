"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";

export function ClearCartOnMount() {
  const { clear } = useCart();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
