import { ProductForm } from "../ProductForm";
import { createProductAction } from "../actions";

export const metadata = { title: "Nuevo vinilo | Admin" };

export default async function NuevoProductoPage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string; album?: string }>;
}) {
  const { artist, album } = await searchParams;

  return (
    <div className="max-w-xl">
      <h1 className="font-display mb-6 text-2xl font-bold text-deep-grove">
        Nuevo vinilo
      </h1>
      <ProductForm
        action={createProductAction}
        submitLabel="Publicar vinilo"
        initialArtist={artist}
        initialAlbum={album}
      />
    </div>
  );
}
