import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { ProductForm } from "../../ProductForm";
import { updateProductAction } from "../../actions";

export const metadata = { title: "Editar vinilo | Admin" };
export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const boundAction = updateProductAction.bind(null, id);

  return (
    <div className="max-w-xl">
      <h1 className="font-display mb-6 text-2xl font-bold text-deep-grove">
        Editar vinilo
      </h1>
      <ProductForm
        action={boundAction}
        product={{ ...product, price: product.price.toString() }}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
