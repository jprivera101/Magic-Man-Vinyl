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

export function AdminNav() {
  const pathname = usePathname();

  const matches = LINKS.filter(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`),
  );
  const activeHref = matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="flex gap-1 overflow-x-auto px-4 sm:px-6">
      {LINKS.map((link) => {
        const active = link.href === activeHref;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition ${
              active
                ? "border-retro-rust text-retro-rust"
                : "border-transparent text-vintage-cream/70 hover:text-vintage-cream"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
