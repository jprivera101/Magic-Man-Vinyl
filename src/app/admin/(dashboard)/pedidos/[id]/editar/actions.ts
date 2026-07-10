"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customOrderEditSchema } from "@/lib/validation";
import { getOrderById, updateCustomOrderDetails } from "@/lib/orders";

export type CustomOrderEditFormState = { error?: string };

export async function updateCustomOrderAction(
  orderId: number,
  prevState: CustomOrderEditFormState,
  formData: FormData,
): Promise<CustomOrderEditFormState> {
  const order = await getOrderById(orderId);
  if (!order) {
    return { error: "Este pedido ya no existe." };
  }

  const isCustom = order.items.some((item) => item.product.isCustom);
  if (!isCustom) {
    return { error: "Solo los pedidos personalizados se pueden editar así." };
  }

  const parsed = customOrderEditSchema.safeParse({
    direccion: formData.get("direccion"),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      price: formData.get(`price-${item.id}`),
      cost: formData.get(`cost-${item.id}`) || undefined,
    })),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  await updateCustomOrderDetails(orderId, parsed.data);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin/pedidos/personalizado");
  redirect(`/admin/pedidos/${orderId}`);
}
