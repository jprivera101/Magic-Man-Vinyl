"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/skus", label: "SKUs" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/pedidos/personalizado", label: "Personalizado" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export function AdminNav({
  pendingCatalogo = 0,
  pendingPersonalizado = 0,
}: {
  pendingCatalogo?: number;
  pendingPersonalizado?: number;
}) {
  const pathname = usePathname();

  const matches = LINKS.filter(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`),
  );
  const activeHref = matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const badges: Record<string, number> = {
    "/admin/pedidos": pendingCatalogo,
    "/admin/pedidos/personalizado": pendingPersonalizado,
  };

  return (
    <nav className="flex gap-1 overflow-x-auto px-4 sm:px-6">
      {LINKS.map((link) => {
        const active = link.href === activeHref;
        const badge = badges[link.href] ?? 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition ${
              active
                ? "border-retro-rust text-retro-rust"
                : "border-transparent text-vintage-cream/70 hover:text-vintage-cream"
            }`}
          >
            {link.label}
            {badge > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-retro-rust px-1.5 text-[11px] font-bold text-vintage-cream">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
