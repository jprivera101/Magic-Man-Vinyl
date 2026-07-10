import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-deep-grove/10 bg-vintage-cream py-6 text-center text-sm text-deep-grove/60">
      <p>Magic Man Vinyl — Records · Good Vibes · Timeless Magic</p>
      <p className="mt-1">Guatemala · Pedidos solo por depósito</p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-deep-grove/40">
        Powered by Penthouse Consulting
        <Image
          src="/branding/penthouse-logo.png"
          alt="Penthouse Consulting"
          width={14}
          height={14}
          className="h-3.5 w-3.5"
        />
      </p>
    </footer>
  );
}
