import { TrackForm } from "./TrackForm";

export const metadata = {
  title: "Rastrear pedido | Magic Man Vinyl",
};

export default function RastreoPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-deep-grove sm:text-3xl">
        Rastrear mi pedido
      </h1>
      <p className="mt-2 text-sm text-deep-grove/70">
        Ingresa el número de orden que te dimos al hacer el pedido junto con el
        teléfono o correo que usaste.
      </p>
      <div className="mt-6">
        <TrackForm />
      </div>
    </div>
  );
}
