"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/validation";
import {
  createProduct,
  updateProduct,
  deleteProductById,
  getProductById,
} from "@/lib/products";
import { uploadProductImage, UploadError } from "@/lib/storage";
import { lookupByArtistAlbum, type ProductLookup } from "@/lib/sku";
import { createPromotion, endPromotion } from "@/lib/promotions";

export type ProductFormState = { error?: string };

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    artist: formData.get("artist"),
    album: formData.get("album"),
    price: formData.get("price"),
    genre: formData.get("genre") || undefined,
    year: formData.get("year") || undefined,
    condition: formData.get("condition") || undefined,
    units: formData.get("units") || 1,
  });
}

export async function lookupProductAction(
  artist: string,
  album: string,
): Promise<ProductLookup | null> {
  return lookupByArtistAlbum(artist, album);
}

export async function createProductAction(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Debes subir una foto del vinilo." };
  }

  let imageUrl: string;
  try {
    imageUrl = await uploadProductImage(file);
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message };
    throw err;
  }

  await createProduct({ ...parsed.data, imageUrl });
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProductAction(
  id: string,
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }

  const existing = await getProductById(id);
  if (!existing) {
    return { error: "Este producto ya no existe." };
  }

  // El artista, álbum y foto no se editan aquí — son parte del SKU y quedan
  // fijos desde que se creó el producto, sin importar lo que venga en el form.
  await updateProduct(id, {
    ...parsed.data,
    artist: existing.artist,
    album: existing.album,
    imageUrl: existing.imageUrl,
  });
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/${id}`);
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function deleteProductAction(id: string) {
  await deleteProductById(id);
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}

export async function createPromotionAction(
  productId: string,
  percent: number,
  days: number,
) {
  await createPromotion(productId, percent, days);
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}

export async function endPromotionAction(promotionId: string) {
  await endPromotion(promotionId);
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}
