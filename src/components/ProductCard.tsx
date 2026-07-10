import Image from "next/image";
import Link from "next/link";
import { formatQuetzales } from "@/lib/format";
import type { ProductWithAvailability } from "@/lib/products";

export function ProductCard({ product }: { product: ProductWithAvailability }) {
  const onSale = Boolean(product.activePromotion);

  return (
    <Link
      href={`/catalogo/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white/60 shadow-sm ring-1 ring-deep-grove/10 transition hover:shadow-md hover:ring-deep-grove/20"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-deep-grove/5">
        <Image
          src={product.imageUrl}
          alt={`${product.album} — ${product.artist}`}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {onSale && (
          <span className="absolute left-2 top-2 rounded-full bg-retro-rust px-2 py-0.5 text-[11px] font-bold text-vintage-cream shadow-sm">
            -{product.activePromotion!.percent}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-deep-grove/60">
          {product.artist}
        </p>
        <h3 className="font-display line-clamp-2 text-sm font-semibold leading-tight text-deep-grove">
          {product.album}
        </h3>
        {onSale ? (
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-base font-bold text-retro-rust">
              {formatQuetzales(product.effectivePrice)}
            </span>
            <span className="font-display text-xs text-deep-grove/40 line-through">
              {formatQuetzales(product.price.toString())}
            </span>
          </p>
        ) : (
          <p className="mt-1 font-display text-base font-bold text-retro-rust">
            {formatQuetzales(product.price.toString())}
          </p>
        )}
      </div>
    </Link>
  );
}
