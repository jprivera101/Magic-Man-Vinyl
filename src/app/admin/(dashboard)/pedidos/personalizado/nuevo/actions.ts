"use server";

import { revalidatePath } from "next/cache";
import { customOrderClientSchema, customOrderItemsSchema } from "@/lib/validation";
import { createCustomOrder } from "@/lib/orders";
import { uploadProductImage, UploadError } from "@/lib/storage";

export type CustomOrderResult = { error?: string; orderDbId?: number };

const PLACEHOLDER_IMAGE = "/branding/vinyl-placeholder.png";

export async function createCustomOrderAction(
  formData: FormData,
): Promise<CustomOrderResult> {
  const clientParsed = customOrderClientSchema.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    telefono: formData.get("telefono"),
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

  const items: { artist: string; album: string; price: number; imageUrl: string }[] = [];
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
