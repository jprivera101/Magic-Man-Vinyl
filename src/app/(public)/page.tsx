import Image from "next/image";
import Link from "next/link";
import { ShippingBadges } from "@/components/ShippingBadges";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-12 text-center sm:py-16">
      <Image
        src="/branding/logo.png"
        alt="Magic Man Vinyl"
        width={160}
        height={160}
        priority
        className="h-28 w-28 sm:h-40 sm:w-40"
      />
      <h1 className="font-display mt-5 text-2xl font-bold text-deep-grove sm:text-4xl">
        Discos de vinilo con un toque de magia
      </h1>
      <p className="mt-3 max-w-xl text-balance text-sm text-deep-grove/70 sm:text-base">
        Records · Good vibes · Timeless magic. Vinilos seleccionados a un
        buen precio, directo a tu casa en Guatemala.
      </p>
      <div className="mt-7 flex w-full max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:justify-center">
        <Link
          href="/catalogo"
          className="font-display flex w-full items-center justify-center rounded-full bg-retro-rust px-8 py-3.5 text-base font-bold text-vintage-cream shadow-md transition hover:bg-retro-rust-dark active:scale-95 sm:w-auto"
        >
          Ver catálogo
        </Link>
        <Link
          href="/rastreo"
          className="font-display flex w-full items-center justify-center rounded-full border border-deep-grove/20 bg-white px-8 py-3.5 text-base font-bold text-deep-grove shadow-sm transition hover:border-retro-rust/50 sm:w-auto"
        >
          Rastrear mi pedido
        </Link>
      </div>
      <ShippingBadges className="mt-7 justify-center" />
    </div>
  );
}
