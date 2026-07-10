"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Enviando...",
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center rounded-full bg-retro-rust px-6 py-3 text-base font-semibold text-vintage-cream shadow-sm transition hover:bg-retro-rust-dark disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? pendingText : children}
    </button>
  );
}
