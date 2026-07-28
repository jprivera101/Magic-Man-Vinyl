"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/orders";
import { requireAdminSession } from "@/lib/session";
import type { $Enums } from "@/generated/prisma/client";

export async function updateOrderStatusAction(
  id: number,
  status: $Enums.OrderStatus,
  rejectionReason?: string,
) {
  await requireAdminSession();
  await updateOrderStatus(id, status, rejectionReason);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
}
