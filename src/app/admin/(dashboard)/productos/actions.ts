"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/validation";
import {
  createProduct,
  updateProduct,
  deleteProductById,
  getProductById,
  invalidateProductsCache,
} from "@/lib/products";
import { uploadProductImage, UploadError } from "@/lib/storage";
import { lookupByArtistAlbum, type ProductLookup } from "@/lib/sku";
import { createPromotion, endPromotion } from "@/lib/promotions";
import { requireAdminSession } from "@/lib/session";

export type ProductFormState = { error?: string };

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    artist: formData.get("artist"),
    album: formData.get("album"),
    price: formData.get("price"),
    cost: formData.get("cost") || undefined,
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
  await requireAdminSession();
  return lookupByArtistAlbum(artist, album);
}

export async function createProductAction(
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminSession();
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
  invalidateProductsCache();
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function updateProductAction(
  id: string,
  prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdminSession();
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
  // El costo sí se puede borrar por completo (a diferencia de género/año/
  // estado): dejarlo vacío lo pone en null en vez de dejar el valor anterior.
  await updateProduct(id, {
    ...parsed.data,
    cost: parsed.data.cost ?? null,
    artist: existing.artist,
    album: existing.album,
    imageUrl: existing.imageUrl,
  });
  invalidateProductsCache();
  revalidatePath("/catalogo");
  revalidatePath(`/catalogo/${id}`);
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}

export async function deleteProductAction(id: string) {
  await requireAdminSession();
  await deleteProductById(id);
  invalidateProductsCache();
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}

export async function createPromotionAction(
  productId: string,
  percent: number,
  days: number,
) {
  await requireAdminSession();
  await createPromotion(productId, percent, days);
  invalidateProductsCache();
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}

export async function endPromotionAction(promotionId: string) {
  await requireAdminSession();
  await endPromotion(promotionId);
  invalidateProductsCache();
  revalidatePath("/catalogo");
  revalidatePath("/admin/productos");
}
