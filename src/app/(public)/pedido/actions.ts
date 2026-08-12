"use server";

import { redirect } from "next/navigation";
import { orderSchema, cartItemsSchema } from "@/lib/validation";
import { createOrder, OrderError, lookupClientAddress } from "@/lib/orders";
import { uploadDepositImage, UploadError } from "@/lib/storage";
import { enforceRateLimit, getClientIp, RateLimitError } from "@/lib/rateLimit";
import { notifyNewOrder } from "@/lib/notify";

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
  // Honeypot: real customers never fill this field (hidden off-screen); bots that
  // blindly fill every input do. Reject quietly with a normal-looking error.
  if (String(formData.get("hp_verificacion") ?? "").trim() !== "") {
    return { error: "No pudimos procesar tu pedido. Intenta de nuevo." };
  }

  const ip = await getClientIp();
  try {
    await enforceRateLimit("submit-order", ip, { max: 5, windowMinutes: 15 });
  } catch (err) {
    if (err instanceof RateLimitError) return { error: err.message };
    throw err;
  }

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

  // Second, tighter cap keyed on the contact info itself — catches an attacker
  // rotating IPs but still driving orders through the same phone/email.
  const contactKey = parsed.data.telefono ?? parsed.data.email;
  if (contactKey) {
    try {
      await enforceRateLimit("submit-order-contact", contactKey, { max: 3, windowMinutes: 60 });
    } catch (err) {
      if (err instanceof RateLimitError) return { error: err.message };
      throw err;
    }
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

  await notifyNewOrder(order);

  redirect(`/pedido/gracias?orden=${order.codigo}`);
}
