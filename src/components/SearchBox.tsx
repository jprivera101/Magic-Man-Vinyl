"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchBox({ current }: { current: string }) {
  const [open, setOpen] = useState(Boolean(current));
  const [value, setValue] = useState(current);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function applySearch(q: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applySearch(value);
  }

  function handleClose() {
    setValue("");
    setOpen(false);
    applySearch("");
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar en el catálogo"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-deep-grove/20 bg-white text-deep-grove shadow-sm transition hover:border-retro-rust/50"
      >
        <Search size={18} />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-2">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-deep-grove/40"
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar por artista o álbum..."
          className="w-full rounded-xl border border-deep-grove/20 bg-white py-2.5 pl-9 pr-3 text-sm text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
        />
      </div>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Cerrar búsqueda"
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-deep-grove/50 transition hover:bg-deep-grove/10"
      >
        <X size={18} />
      </button>
    </form>
  );
}
