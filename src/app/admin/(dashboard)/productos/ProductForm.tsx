"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ProductFormState } from "./actions";
import { lookupProductAction } from "./actions";
import { ImageField } from "@/components/ImageField";
import { SubmitButton } from "@/components/SubmitButton";
import { CONDICIONES_VINILO } from "@/lib/validation";
import { formatQuetzales } from "@/lib/format";
import type { ProductWithAvailability } from "@/lib/products";
import type { ProductLookup } from "@/lib/sku";
import { PackageSearch, Sparkles, Lock } from "lucide-react";

type ProductAction = (
  prevState: ProductFormState,
  formData: FormData,
) => Promise<ProductFormState>;

// Prisma's Decimal can't cross the server->client boundary, so callers must
// serialize price to a string first.
export type SerializedProduct = Omit<ProductWithAvailability, "price"> & {
  price: string;
};

const initialState: ProductFormState = {};

export function ProductForm({
  action,
  product,
  submitLabel,
  initialArtist,
  initialAlbum,
}: {
  action: ProductAction;
  product?: SerializedProduct;
  submitLabel: string;
  initialArtist?: string;
  initialAlbum?: string;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const [lookup, setLookup] = useState<ProductLookup | null>(null);
  const artistRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  async function checkDuplicate() {
    const artist = artistRef.current?.value ?? "";
    const album = albumRef.current?.value ?? "";
    if (!artist.trim() || !album.trim()) {
      setLookup(null);
      return;
    }
    const result = await lookupProductAction(artist, album);
    setLookup(result);
  }

  useEffect(() => {
    if (product || !initialArtist || !initialAlbum) return;
    const timeoutId = setTimeout(() => checkDuplicate(), 0);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useLastPrice() {
    if (lookup?.lastPrice !== undefined && priceInputRef.current) {
      priceInputRef.current.value = String(lookup.lastPrice);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {product ? (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Foto del vinilo
          </span>
          <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl bg-deep-grove/5">
            <Image src={product.imageUrl} alt={product.album} fill className="object-cover" />
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-deep-grove/50">
            <Lock size={12} />
            La foto no se puede cambiar aquí. Si necesitas otra, crea un nuevo vinilo.
          </p>
        </div>
      ) : (
        <ImageField
          name="image"
          label="Foto del vinilo"
          helpText="JPG, PNG o WEBP, máximo 5MB."
          required
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Artista
          </span>
          <input
            ref={artistRef}
            type="text"
            name="artist"
            required
            readOnly={Boolean(product)}
            defaultValue={product?.artist ?? initialArtist}
            onBlur={product ? undefined : checkDuplicate}
            className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none ${
              product
                ? "border-deep-grove/10 bg-deep-grove/5 text-deep-grove/60"
                : "border-deep-grove/20 bg-white text-deep-grove focus:border-retro-rust focus:ring-1 focus:ring-retro-rust"
            }`}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Álbum
          </span>
          <input
            ref={albumRef}
            type="text"
            name="album"
            required
            readOnly={Boolean(product)}
            defaultValue={product?.album ?? initialAlbum}
            onBlur={product ? undefined : checkDuplicate}
            className={`w-full rounded-xl border px-4 py-3 text-base shadow-sm focus:outline-none ${
              product
                ? "border-deep-grove/10 bg-deep-grove/5 text-deep-grove/60"
                : "border-deep-grove/20 bg-white text-deep-grove focus:border-retro-rust focus:ring-1 focus:ring-retro-rust"
            }`}
          />
        </label>
      </div>
      {product && (
        <p className="-mt-2 flex items-center gap-1.5 text-xs text-deep-grove/50">
          <Lock size={12} />
          Artista y álbum no se pueden editar — son parte del SKU. Crea un
          nuevo vinilo si te equivocaste.
        </p>
      )}

      {!product && lookup?.isNew === false && (
        <div className="rounded-xl bg-golden-hour/10 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-semibold text-deep-grove">
            <PackageSearch size={14} />
            Ya existe en la base de datos
          </p>
          <p className="mt-1 text-deep-grove/70">
            {lookup.totalSold} vendido{lookup.totalSold === 1 ? "" : "s"} en
            total · último precio {formatQuetzales(lookup.lastPrice ?? 0)}
          </p>
          <button
            type="button"
            onClick={useLastPrice}
            className="mt-2 rounded-full bg-deep-grove px-3 py-1.5 text-xs font-semibold text-vintage-cream transition hover:bg-deep-grove-light"
          >
            Usar el último precio ({formatQuetzales(lookup.lastPrice ?? 0)})
          </button>
        </div>
      )}

      {!product && lookup?.isNew === true && (
        <p className="flex items-center gap-1.5 text-xs text-deep-grove/50">
          <Sparkles size={12} />
          Disco nuevo — todavía no tiene historial de precios
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Precio (Q)
          </span>
          <input
            ref={priceInputRef}
            type="number"
            name="price"
            step="0.01"
            min="0"
            required
            defaultValue={product ? Number(product.price) : undefined}
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Unidades disponibles
          </span>
          <input
            type="number"
            name="units"
            step="1"
            min="1"
            required
            defaultValue={product ? product.units : 1}
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          />
          {product && (
            <p className="mt-1.5 text-xs text-deep-grove/60">
              Ahora mismo quedan {product.availableUnits} de {product.units} sin
              reservar.
            </p>
          )}
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Género <span className="font-normal text-deep-grove/50">(opcional)</span>
          </span>
          <input
            type="text"
            name="genre"
            defaultValue={product?.genre ?? ""}
            placeholder="Rock, Salsa..."
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Año <span className="font-normal text-deep-grove/50">(opcional)</span>
          </span>
          <input
            type="number"
            name="year"
            defaultValue={product?.year ?? ""}
            placeholder="1977"
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Estado <span className="font-normal text-deep-grove/50">(opcional)</span>
          </span>
          <select
            name="condition"
            defaultValue={product?.condition ?? ""}
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          >
            <option value="">Sin especificar</option>
            {CONDICIONES_VINILO.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {state.error && (
        <p className="rounded-xl bg-retro-rust/10 px-4 py-3 text-sm font-medium text-retro-rust-dark">
          {state.error}
        </p>
      )}

      <SubmitButton pendingText="Guardando...">{submitLabel}</SubmitButton>
    </form>
  );
}
