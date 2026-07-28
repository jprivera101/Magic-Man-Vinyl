"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/session";
import { enforceRateLimit, getClientIp, RateLimitError } from "@/lib/rateLimit";

export type LoginFormState = { error?: string };

export async function loginAction(
  prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const ip = await getClientIp();
  try {
    // Throttles brute-forcing ADMIN_PASSWORD — counts both failed and successful attempts.
    await enforceRateLimit("admin-login", ip, { max: 10, windowMinutes: 15 });
  } catch (err) {
    if (err instanceof RateLimitError) return { error: err.message };
    throw err;
  }

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
