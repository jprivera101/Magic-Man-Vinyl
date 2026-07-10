"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { bankAccountSchema } from "@/lib/validation";
import { createBankAccount, updateBankAccount, setBankAccountActive } from "@/lib/bankAccounts";

export type BankAccountFormState = { error?: string };

function parse(formData: FormData) {
  return bankAccountSchema.safeParse({
    banco: formData.get("banco"),
    numeroCuenta: formData.get("numeroCuenta"),
    tipoCuenta: formData.get("tipoCuenta"),
    titular: formData.get("titular"),
  });
}

export async function createBankAccountAction(
  prevState: BankAccountFormState,
  formData: FormData,
): Promise<BankAccountFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  await createBankAccount(parsed.data);
  revalidatePath("/admin/configuracion");
  revalidatePath("/pedido");
  redirect("/admin/configuracion");
}

export async function updateBankAccountAction(
  id: string,
  prevState: BankAccountFormState,
  formData: FormData,
): Promise<BankAccountFormState> {
  const parsed = parse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  await updateBankAccount(id, parsed.data);
  revalidatePath("/admin/configuracion");
  revalidatePath("/pedido");
  redirect("/admin/configuracion");
}

export async function toggleBankAccountActiveAction(id: string, active: boolean) {
  await setBankAccountActive(id, active);
  revalidatePath("/admin/configuracion");
  revalidatePath("/pedido");
}
