"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/session";

export type LoginFormState = { error?: string };

export async function loginAction(
  prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const password = formData.get("password");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: "El sitio no tiene configurada la contraseña de administrador." };
  }

  if (typeof password !== "string" || password !== adminPassword) {
    return { error: "Contraseña incorrecta." };
  }

  await createAdminSession();
  redirect("/admin");
}
