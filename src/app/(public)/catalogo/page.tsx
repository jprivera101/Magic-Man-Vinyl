import { getAvailableProducts, parseSort } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";
import { SearchBox } from "@/components/SearchBox";
import { Disc3, SearchX } from "lucide-react";

export const metadata = {
  title: "Catálogo | Magic Man Vinyl",
};

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { sort: sortParam, q } = await searchParams;
  const sort = parseSort(sortParam);
  const search = q ?? "";
  const products = await getAvailableProducts(sort, search);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-bold text-deep-grove sm:text-3xl">
            Catálogo
          </h1>
          <div className="flex flex-1 justify-end sm:hidden">
            <SearchBox current={search} />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="hidden sm:block">
            <SearchBox current={search} />
          </div>
          <SortSelect current={sort} />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/60 py-20 text-center text-deep-grove/60">
          {search ? (
            <>
              <SearchX size={40} />
              <p>No encontramos vinilos que coincidan con &quot;{search}&quot;.</p>
            </>
          ) : (
            <>
              <Disc3 size={40} />
              <p>Por ahora no hay vinilos disponibles. ¡Vuelve pronto!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
