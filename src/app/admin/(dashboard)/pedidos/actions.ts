"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/orders";
import { invalidateProductsCache } from "@/lib/products";
import { requireAdminSession } from "@/lib/session";
import type { $Enums } from "@/generated/prisma/client";

export async function updateOrderStatusAction(
  id: number,
  status: $Enums.OrderStatus,
  rejectionReason?: string,
) {
  await requireAdminSession();
  await updateOrderStatus(id, status, rejectionReason);
  // Rechazar un pedido libera las unidades reservadas; cualquier otro cambio de
  // estado no afecta disponibilidad, pero invalidar de más aquí no cuesta nada.
  invalidateProductsCache();
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
}
