import { CarritoView } from "./CarritoView";

export const metadata = {
  title: "Carrito | Magic Man Vinyl",
};

export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display mb-6 text-2xl font-bold text-deep-grove sm:text-3xl">
        Tu carrito
      </h1>
      <CarritoView />
    </div>
  );
}
