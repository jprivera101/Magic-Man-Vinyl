import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BankAccountForm } from "../BankAccountForm";
import { createBankAccountAction } from "../actions";

export const metadata = { title: "Nueva cuenta bancaria | Admin" };

export default function NuevaCuentaBancariaPage() {
  return (
    <div className="max-w-lg">
      <Link
        href="/admin/configuracion"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-deep-grove/60 hover:text-deep-grove"
      >
        <ArrowLeft size={16} />
        Volver a cuentas bancarias
      </Link>
      <h1 className="font-display mb-6 text-2xl font-bold text-deep-grove">
        Nueva cuenta bancaria
      </h1>
      <BankAccountForm action={createBankAccountAction} submitLabel="Agregar cuenta" />
    </div>
  );
}
