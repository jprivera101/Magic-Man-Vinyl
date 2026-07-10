"use server";

import { getProductsByIds } from "@/lib/products";

export type CartProduct = {
  id: string;
  artist: string;
  album: string;
  price: string;
  imageUrl: string;
  availableUnits: number;
};

export async function getCartProductsAction(ids: string[]): Promise<CartProduct[]> {
  const products = await getProductsByIds(ids);
  return products.map((p) => ({
    id: p.id,
    artist: p.artist,
    album: p.album,
    price: p.effectivePrice.toString(),
    imageUrl: p.imageUrl,
    availableUnits: p.availableUnits,
  }));
}
