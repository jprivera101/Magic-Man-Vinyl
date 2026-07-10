"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ImagePlus } from "lucide-react";
import { createCustomOrderAction } from "./actions";
import { formatQuetzales } from "@/lib/format";

type Item = {
  key: string;
  artist: string;
  album: string;
  price: string;
  cost: string;
  file: File | null;
  preview: string | null;
};

function newItem(): Item {
  return {
    key: Math.random().toString(36).slice(2),
    artist: "",
    album: "",
    price: "",
    cost: "",
    file: null,
    preview: null,
  };
}

export function CustomOrderForm() {
  const [items, setItems] = useState<Item[]>([newItem()]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function addItem() {
    setItems((prev) => [...prev, newItem()]);
  }

  function removeItem(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.key !== key) : prev));
  }

  function updateItem(key: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function handleFile(key: string, file: File | null) {
    updateItem(key, { file, preview: file ? URL.createObjectURL(file) : null });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set(
      "items",
      JSON.stringify(
        items.map((i) => ({ artist: i.artist, album: i.album, price: i.price, cost: i.cost })),
      ),
    );
    items.forEach((item, idx) => {
      if (item.file) formData.set(`image-${idx}`, item.file);
    });

    startTransition(async () => {
      const result = await createCustomOrderAction(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.orderDbId) {
        router.push(`/admin/pedidos/${result.orderDbId}`);
      }
    });
  }

  const total = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-deep-grove/10">
        <h2 className="font-display mb-3 text-lg font-semibold text-deep-grove">
          Datos del cliente
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
              Nombre
            </span>
            <input
              type="text"
              name="nombre"
              required
              placeholder="Ej. Juan"
              pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü]{2,40}"
              title="Una sola palabra, sin espacios ni signos"
              className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
              Apellido
            </span>
            <input
              type="text"
              name="apellido"
              required
              placeholder="Ej. Pérez"
              pattern="[A-Za-zÁÉÍÓÚÑÜáéíóúñü]{2,40}"
              title="Una sola palabra, sin espacios ni signos"
              className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
            />
          </label>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
              Teléfono
            </span>
            <input
              type="tel"
              name="telefono"
              inputMode="numeric"
              maxLength={8}
              pattern="\d{8}"
              placeholder="Ej. 55551234"
              className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
              Correo electrónico
            </span>
            <input
              type="email"
              name="email"
              placeholder="tucorreo@ejemplo.com"
              className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
            />
          </label>
        </div>
        <p className="mt-1.5 text-xs text-deep-grove/50">
          Deja al menos un teléfono o un correo — con eso el cliente también
          podrá rastrear su pedido en /rastreo.
        </p>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Dirección de envío
          </span>
          <textarea
            name="direccion"
            required
            rows={3}
            placeholder="Dirección completa, zona, municipio y departamento"
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          />
        </label>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-deep-grove">Vinilos</h2>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 rounded-full bg-deep-grove px-3 py-2 text-xs font-semibold text-vintage-cream transition hover:bg-deep-grove-light"
          >
            <Plus size={14} />
            Agregar vinilo
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-deep-grove/10"
            >
              <label className="relative flex h-16 w-16 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-deep-grove/25 bg-deep-grove/5 text-deep-grove/40">
                {item.preview ? (
                  <Image src={item.preview} alt="" fill unoptimized className="object-cover" />
                ) : (
                  <ImagePlus size={18} />
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => handleFile(item.key, e.target.files?.[0] ?? null)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>

              <div className="grid flex-1 grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Artista"
                  value={item.artist}
                  onChange={(e) => updateItem(item.key, { artist: e.target.value })}
                  className="col-span-2 rounded-lg border border-deep-grove/20 bg-white px-3 py-2 text-sm text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust sm:col-span-1"
                />
                <input
                  type="text"
                  required
                  placeholder="Álbum"
                  value={item.album}
                  onChange={(e) => updateItem(item.key, { album: e.target.value })}
                  className="col-span-2 rounded-lg border border-deep-grove/20 bg-white px-3 py-2 text-sm text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust sm:col-span-1"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="Precio (Q)"
                  value={item.price}
                  onChange={(e) => updateItem(item.key, { price: e.target.value })}
                  className="rounded-lg border border-deep-grove/20 bg-white px-3 py-2 text-sm text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Costo (Q) — solo tú"
                  value={item.cost}
                  onChange={(e) => updateItem(item.key, { cost: e.target.value })}
                  className="rounded-lg border border-deep-grove/20 bg-white px-3 py-2 text-sm text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
                />
              </div>

              <button
                type="button"
                onClick={() => removeItem(item.key)}
                disabled={items.length === 1}
                aria-label="Quitar vinilo"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-deep-grove/40 transition hover:bg-retro-rust/10 hover:text-retro-rust-dark disabled:opacity-30"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-deep-grove/10">
        <span className="font-semibold text-deep-grove">Total</span>
        <span className="font-display text-xl font-bold text-retro-rust">
          {formatQuetzales(total)}
        </span>
      </div>

      {error && (
        <p className="rounded-xl bg-retro-rust/10 px-4 py-3 text-sm font-medium text-retro-rust-dark">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-retro-rust px-6 py-3 text-base font-semibold text-vintage-cream shadow-sm transition hover:bg-retro-rust-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creando pedido..." : "Confirmar pedido"}
      </button>
    </form>
  );
}
