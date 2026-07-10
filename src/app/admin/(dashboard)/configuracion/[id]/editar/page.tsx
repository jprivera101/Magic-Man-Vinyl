import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBankAccountById } from "@/lib/bankAccounts";
import { BankAccountForm } from "../../BankAccountForm";
import { updateBankAccountAction } from "../../actions";

export const metadata = { title: "Editar cuenta bancaria | Admin" };
export const dynamic = "force-dynamic";

export default async function EditarCuentaBancariaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await getBankAccountById(id);
  if (!account) notFound();

  const boundAction = updateBankAccountAction.bind(null, id);

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
        Editar cuenta bancaria
      </h1>
      <BankAccountForm action={boundAction} account={account} submitLabel="Guardar cambios" />
    </div>
  );
}
