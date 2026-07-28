"use server";

import { revalidatePath } from "next/cache";
import { customOrderClientSchema, customOrderItemsSchema } from "@/lib/validation";
import { createCustomOrder } from "@/lib/orders";
import { uploadProductImage, UploadError } from "@/lib/storage";
import { requireAdminSession } from "@/lib/session";
import { enforceRateLimit, RateLimitError } from "@/lib/rateLimit";

export type CustomOrderResult = { error?: string; orderDbId?: number };

const PLACEHOLDER_IMAGE = "/branding/vinyl-placeholder.png";

export async function createCustomOrderAction(
  formData: FormData,
): Promise<CustomOrderResult> {
  await requireAdminSession();

  // There's only one admin account, so this is a shop-wide cap, not per-IP:
  // generous enough for a busy afternoon of custom orders for different
  // clients, but still bounds the damage if the admin session were ever compromised.
  try {
    await enforceRateLimit("create-custom-order", "admin", { max: 7, windowMinutes: 180 });
  } catch (err) {
    if (err instanceof RateLimitError) return { error: err.message };
    throw err;
  }

  const clientParsed = customOrderClientSchema.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    telefono: formData.get("telefono") || undefined,
    email: formData.get("email") || undefined,
    direccion: formData.get("direccion"),
  });
  if (!clientParsed.success) {
    return { error: clientParsed.error.issues[0]?.message ?? "Revisa los datos del cliente." };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Los vinilos no son válidos, intenta de nuevo." };
  }

  const itemsParsed = customOrderItemsSchema.safeParse(rawItems);
  if (!itemsParsed.success) {
    return { error: itemsParsed.error.issues[0]?.message ?? "Revisa los vinilos." };
  }

  const items: { artist: string; album: string; price: number; cost?: number; imageUrl: string }[] = [];
  for (let i = 0; i < itemsParsed.data.length; i++) {
    const item = itemsParsed.data[i];
    const file = formData.get(`image-${i}`);
    let imageUrl = PLACEHOLDER_IMAGE;
    if (file instanceof File && file.size > 0) {
      try {
        imageUrl = await uploadProductImage(file);
      } catch (err) {
        if (err instanceof UploadError) return { error: err.message };
        throw err;
      }
    }
    items.push({ ...item, imageUrl });
  }

  const order = await createCustomOrder({ ...clientParsed.data, items });
  revalidatePath("/admin/pedidos");
  return { orderDbId: order.id };
}
