import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { formatQuetzales } from "@/lib/format";
import { ShippingBadges } from "@/components/ShippingBadges";
import { AddToCartBar } from "./AddToCartBar";
import { Flame } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-deep-grove/5 shadow-sm">
        <Image
          src={product.imageUrl}
          alt={`${product.album} — ${product.artist}`}
          fill
          sizes="(min-width: 640px) 384px, 70vw"
          priority
          className="object-cover"
        />
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium uppercase tracking-wide text-deep-grove/60">
          {product.artist}
        </p>
        <h1 className="font-display text-2xl font-bold text-deep-grove sm:text-3xl">
          {product.album}
        </h1>
        {product.activePromotion ? (
          <div className="mt-2 flex items-center gap-2">
            <p className="font-display text-3xl font-bold text-retro-rust">
              {formatQuetzales(product.effectivePrice)}
            </p>
            <p className="font-display text-lg text-deep-grove/40 line-through">
              {formatQuetzales(product.price.toString())}
            </p>
            <span className="rounded-full bg-retro-rust px-2 py-0.5 text-xs font-bold text-vintage-cream">
              -{product.activePromotion.percent}%
            </span>
          </div>
        ) : (
          <p className="font-display mt-2 text-3xl font-bold text-retro-rust">
            {formatQuetzales(product.price.toString())}
          </p>
        )}

        {product.availableUnits === 1 && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-retro-rust-dark">
            <Flame size={15} />
            Solo queda 1 disponible
          </p>
        )}

        <ShippingBadges className="mt-4" />

        {(product.genre || product.year || product.condition) && (
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {product.genre && (
              <div className="rounded-xl bg-white/60 px-3 py-2">
                <dt className="text-deep-grove/50">Género</dt>
                <dd className="font-semibold text-deep-grove">{product.genre}</dd>
              </div>
            )}
            {product.year && (
              <div className="rounded-xl bg-white/60 px-3 py-2">
                <dt className="text-deep-grove/50">Año</dt>
                <dd className="font-semibold text-deep-grove">{product.year}</dd>
              </div>
            )}
            {product.condition && (
              <div className="rounded-xl bg-white/60 px-3 py-2">
                <dt className="text-deep-grove/50">Estado</dt>
                <dd className="font-semibold text-deep-grove">
                  {product.condition}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      <AddToCartBar productId={product.id} availableUnits={product.availableUnits} />
    </div>
  );
}
