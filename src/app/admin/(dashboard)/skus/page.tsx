import Image from "next/image";
import Link from "next/link";
import { getSkuReport } from "@/lib/sku";
import { formatQuetzales } from "@/lib/format";
import { RefreshCw, Search } from "lucide-react";

export const metadata = { title: "SKUs | Admin" };
export const dynamic = "force-dynamic";

function SkuRow({
  row,
}: {
  row: Awaited<ReturnType<typeof getSkuReport>>[number];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
        <Image src={row.imageUrl} alt={row.album} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-semibold text-deep-grove">
          {row.artist} — {row.album}
        </p>
        <p className="text-xs text-deep-grove/50">
          {row.listingsCount}{" "}
          {row.listingsCount === 1 ? "publicación" : "publicaciones"}
        </p>
      </div>
      <div className="text-right text-sm">
        <p className="text-deep-grove/60">
          Vendidos: <span className="font-semibold text-deep-grove">{row.totalSold}</span>
        </p>
        <p className="text-deep-grove/60">
          Último precio:{" "}
          <span className="font-semibold text-deep-grove">
            {formatQuetzales(row.lastPrice)}
          </span>
        </p>
        {row.currentPrice !== null && (
          <p className="text-deep-grove/60">
            Precio actual:{" "}
            <span className="font-semibold text-retro-rust">
              {formatQuetzales(row.currentPrice)}
            </span>
          </p>
        )}
      </div>
      <Link
        href={`/admin/productos/nuevo?artist=${encodeURIComponent(row.artist)}&album=${encodeURIComponent(row.album)}`}
        className="flex items-center gap-1.5 rounded-full bg-deep-grove px-3 py-2 text-xs font-semibold text-vintage-cream transition hover:bg-deep-grove-light"
      >
        <RefreshCw size={13} />
        Restock
      </Link>
    </div>
  );
}

export default async function SkusAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const search = q?.trim().toLowerCase() ?? "";

  let rows = await getSkuReport();
  if (search) {
    rows = rows.filter(
      (r) =>
        r.artist.toLowerCase().includes(search) || r.album.toLowerCase().includes(search),
    );
  }

  const enStock = rows.filter((r) => r.availableUnits > 0);
  const agotado = rows.filter((r) => r.availableUnits === 0);

  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-bold text-deep-grove">SKUs</h1>
      <p className="mb-4 text-sm text-deep-grove/60">
        Un renglón por cada disco distinto que has vendido, con lo vendido y el
        historial de precios.
      </p>

      <form className="relative mb-6 max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-deep-grove/40"
        />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por artista o álbum..."
          className="w-full rounded-xl border border-deep-grove/20 bg-white py-2.5 pl-9 pr-3 text-sm text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
        />
      </form>

      {rows.length === 0 ? (
        <p className="rounded-2xl bg-white/60 py-16 text-center text-deep-grove/60">
          {search
            ? `No encontramos discos que coincidan con "${search}".`
            : "Todavía no has agregado ningún vinilo."}
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-display mb-3 text-lg font-semibold text-deep-grove">
              En stock ({enStock.length})
            </h2>
            {enStock.length === 0 ? (
              <p className="rounded-2xl bg-white/60 py-8 text-center text-sm text-deep-grove/50">
                No hay discos en stock.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {enStock.map((row) => (
                  <SkuRow key={row.sku} row={row} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display mb-3 text-lg font-semibold text-deep-grove">
              Agotado ({agotado.length})
            </h2>
            {agotado.length === 0 ? (
              <p className="rounded-2xl bg-white/60 py-8 text-center text-sm text-deep-grove/50">
                No hay discos agotados.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {agotado.map((row) => (
                  <SkuRow key={row.sku} row={row} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
