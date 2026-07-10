import Link from "next/link";
import { Plus, Pencil, Landmark } from "lucide-react";
import { getAllBankAccounts } from "@/lib/bankAccounts";
import { ToggleActiveButton } from "./ToggleActiveButton";

export const metadata = { title: "Cuentas bancarias | Admin" };
export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const accounts = await getAllBankAccounts();

  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-deep-grove">
          Cuentas bancarias
        </h1>
        <Link
          href="/admin/configuracion/nueva"
          className="flex items-center gap-1.5 rounded-full bg-retro-rust px-4 py-2.5 text-sm font-semibold text-vintage-cream shadow-sm transition hover:bg-retro-rust-dark"
        >
          <Plus size={16} />
          Nueva cuenta
        </Link>
      </div>
      <p className="mb-6 text-sm text-deep-grove/60">
        Estas cuentas se muestran a los clientes cuando hacen un pedido — si
        hay más de una activa, el cliente elige a cuál depositar. Desactiva
        una cuenta para que deje de aparecer sin borrar su historial.
      </p>

      {accounts.length === 0 ? (
        <p className="rounded-2xl bg-white/60 py-16 text-center text-deep-grove/60">
          Todavía no has agregado ninguna cuenta bancaria.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-golden-hour/15 text-golden-hour-dark">
                <Landmark size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold text-deep-grove">
                  {account.banco}
                </p>
                <p className="truncate text-sm text-deep-grove/60">
                  {account.tipoCuenta ? `${account.tipoCuenta} · ` : ""}
                  {account.numeroCuenta}
                </p>
                <p className="truncate text-xs text-deep-grove/50">{account.titular}</p>
              </div>
              <ToggleActiveButton id={account.id} active={account.active} />
              <Link
                href={`/admin/configuracion/${account.id}/editar`}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-deep-grove/50 transition hover:bg-deep-grove/10 hover:text-deep-grove"
                aria-label={`Editar ${account.banco}`}
              >
                <Pencil size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
