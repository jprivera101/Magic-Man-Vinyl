import Image from "next/image";
import Link from "next/link";
import { CartButton } from "@/components/cart/CartButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-deep-grove/10 bg-vintage-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/branding/logo.png"
            alt="Magic Man Vinyl"
            width={44}
            height={44}
            priority
            className="h-10 w-10 sm:h-11 sm:w-11"
          />
          <span className="font-display text-lg font-bold tracking-tight text-deep-grove sm:text-xl">
            Magic Man Vinyl
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            href="/catalogo"
            className="rounded-full bg-retro-rust px-4 py-2 text-sm font-semibold text-vintage-cream shadow-sm transition hover:bg-retro-rust-dark"
          >
            Ver catálogo
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
