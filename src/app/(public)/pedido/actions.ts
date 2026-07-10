"use server";

import { redirect } from "next/navigation";
import { orderSchema, cartItemsSchema } from "@/lib/validation";
import { createOrder, OrderError, lookupClientAddress } from "@/lib/orders";
import { uploadDepositImage, UploadError } from "@/lib/storage";

export type OrderFormState = { error?: string };

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü]{2,40}$/;

export async function lookupAddressAction(
  nombre: string,
  apellido: string,
  telefono: string,
  email: string,
): Promise<{ direccion: string } | null> {
  if (!NAME_REGEX.test(nombre.trim()) || !NAME_REGEX.test(apellido.trim())) return null;
  const telefonoLimpio = /^\d{8}$/.test(telefono.trim()) ? telefono.trim() : undefined;
  const emailLimpio = email.trim() || undefined;
  return lookupClientAddress(nombre, apellido, telefonoLimpio, emailLimpio);
}

export async function submitOrderAction(
  prevState: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  let items;
  try {
    items = cartItemsSchema.parse(JSON.parse(String(formData.get("items") ?? "[]")));
  } catch {
    return { error: "Tu carrito no es válido. Vuelve a intentarlo desde el catálogo." };
  }

  const parsed = orderSchema.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    telefono: formData.get("telefono"),
    email: formData.get("email") || undefined,
    direccion: formData.get("direccion"),
    bankAccountId: formData.get("bankAccountId") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario.",
    };
  }

  const file = formData.get("comprobante");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Debes subir una foto del comprobante de depósito." };
  }

  let depositoPath: string;
  try {
    depositoPath = await uploadDepositImage(file);
  } catch (err) {
    if (err instanceof UploadError) return { error: err.message };
    throw err;
  }

  let order;
  try {
    order = await createOrder({ ...parsed.data, depositoPath, items });
  } catch (err) {
    if (err instanceof OrderError) return { error: err.message };
    throw err;
  }

  redirect(`/pedido/gracias?orden=${order.codigo}`);
}
