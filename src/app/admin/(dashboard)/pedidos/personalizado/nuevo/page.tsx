import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomOrderForm } from "./CustomOrderForm";

export const metadata = { title: "Pedido personalizado | Admin" };

export default function PedidoPersonalizadoNuevoPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/pedidos/personalizado"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-deep-grove/60 hover:text-deep-grove"
      >
        <ArrowLeft size={16} />
        Volver a personalizados
      </Link>
      <h1 className="font-display mb-2 text-2xl font-bold text-deep-grove">
        Nuevo pedido personalizado
      </h1>
      <p className="mb-6 text-sm text-deep-grove/60">
        Para clientes que piden discos por encargo. Al confirmar se genera un
        número de orden que puedes compartirles para que rastreen su pedido.
      </p>
      <CustomOrderForm />
    </div>
  );
}
