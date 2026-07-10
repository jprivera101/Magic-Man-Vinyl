"use client";

import { useActionState } from "react";
import { loginAction, type LoginFormState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
          Contraseña
        </span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
        />
      </label>

      {state.error && (
        <p className="rounded-xl bg-retro-rust/10 px-4 py-3 text-sm font-medium text-retro-rust-dark">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Ingresando...">Ingresar</SubmitButton>
    </form>
  );
}
