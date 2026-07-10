import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllProductsForAdmin } from "@/lib/products";
import { formatQuetzales } from "@/lib/format";
import { AvailabilityBadge } from "@/components/StatusBadge";
import { DeleteProductButton } from "./DeleteProductButton";
import { PromotionButton } from "./PromotionButton";
import { daysUntil } from "@/lib/promotions";

export const metadata = { title: "Productos | Admin" };
export const dynamic = "force-dynamic";

export default async function ProductosAdminPage() {
  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-deep-grove">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-1.5 rounded-full bg-retro-rust px-4 py-2.5 text-sm font-semibold text-vintage-cream shadow-sm transition hover:bg-retro-rust-dark"
        >
          <Plus size={16} />
          Nuevo vinilo
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl bg-white/60 py-16 text-center text-deep-grove/60">
          Todavía no has agregado ningún vinilo.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-deep-grove/10"
            >
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={product.imageUrl}
                  alt={product.album}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs uppercase text-deep-grove/50">
                  {product.artist}
                </p>
                <p className="truncate font-display font-semibold text-deep-grove">
                  {product.album}
                </p>
                {product.activePromotion ? (
                  <p className="text-sm font-medium">
                    <span className="text-deep-grove/40 line-through">
                      {formatQuetzales(product.price.toString())}
                    </span>{" "}
                    <span className="text-retro-rust">
                      {formatQuetzales(product.effectivePrice)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm font-medium text-retro-rust">
                    {formatQuetzales(product.price.toString())}
                  </p>
                )}
              </div>
              <AvailabilityBadge
                availableUnits={product.availableUnits}
                units={product.units}
              />
              <PromotionButton
                productId={product.id}
                activePromotion={
                  product.activePromotion
                    ? {
                        id: product.activePromotion.id,
                        percent: product.activePromotion.percent,
                        daysLeft: daysUntil(product.activePromotion.endsAt),
                      }
                    : null
                }
              />
              <Link
                href={`/admin/productos/${product.id}/editar`}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-deep-grove/50 transition hover:bg-deep-grove/10 hover:text-deep-grove"
                aria-label={`Editar ${product.album}`}
              >
                <Pencil size={16} />
              </Link>
              <DeleteProductButton id={product.id} album={product.album} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
