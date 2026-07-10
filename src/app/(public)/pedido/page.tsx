import { getActiveBankAccounts } from "@/lib/bankAccounts";
import { CheckoutView } from "./CheckoutView";

export const metadata = {
  title: "Confirmar pedido | Magic Man Vinyl",
};

export const dynamic = "force-dynamic";

export default async function PedidoPage() {
  const accounts = await getActiveBankAccounts();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-deep-grove sm:text-3xl">
        Confirma tu pedido
      </h1>
      <div className="mt-4">
        <CheckoutView
          accounts={accounts.map((a) => ({
            id: a.id,
            banco: a.banco,
            numeroCuenta: a.numeroCuenta,
            tipoCuenta: a.tipoCuenta,
            titular: a.titular,
          }))}
        />
      </div>
    </div>
  );
}
