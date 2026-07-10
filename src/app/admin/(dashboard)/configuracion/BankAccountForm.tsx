"use client";

import { useActionState } from "react";
import type { BankAccountFormState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import type { BankAccount } from "@/generated/prisma/client";

const initialState: BankAccountFormState = {};

export function BankAccountForm({
  action,
  account,
  submitLabel,
}: {
  action: (prevState: BankAccountFormState, formData: FormData) => Promise<BankAccountFormState>;
  account?: BankAccount;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-deep-grove">Banco</span>
        <input
          type="text"
          name="banco"
          required
          defaultValue={account?.banco}
          placeholder="Ej. Banco Industrial"
          className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
          Número de cuenta
        </span>
        <input
          type="text"
          name="numeroCuenta"
          required
          defaultValue={account?.numeroCuenta}
          className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
          Tipo de cuenta
        </span>
        <input
          type="text"
          name="tipoCuenta"
          defaultValue={account?.tipoCuenta}
          placeholder="Monetaria / Ahorro"
          className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
          Nombre del titular
        </span>
        <input
          type="text"
          name="titular"
          required
          defaultValue={account?.titular}
          className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
        />
      </label>

      {state.error && (
        <p className="rounded-xl bg-retro-rust/10 px-4 py-3 text-sm font-medium text-retro-rust-dark">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Guardando...">{submitLabel}</SubmitButton>
    </form>
  );
}
