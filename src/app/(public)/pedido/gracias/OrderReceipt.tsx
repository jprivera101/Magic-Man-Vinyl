"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Download, CheckCircle2 } from "lucide-react";
import { formatQuetzales } from "@/lib/format";

export type ReceiptItem = {
  artist: string;
  album: string;
  price: string;
  imageUrl: string;
  quantity: number;
};

export function OrderReceipt({
  orderId,
  items,
  total,
}: {
  orderId: string;
  items: ReceiptItem[];
  total: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#f3e9d6",
      });
      const link = document.createElement("a");
      link.download = `pedido-magicmanvinyl-${orderId}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        ref={cardRef}
        className="w-full max-w-sm rounded-3xl border-2 border-dashed border-deep-grove/25 bg-vintage-cream p-6"
      >
        <div className="flex items-center gap-2">
          <Image src="/branding/logo.png" alt="Magic Man Vinyl" width={32} height={32} className="h-8 w-8" />
          <span className="font-display text-sm font-bold text-deep-grove">
            Magic Man Vinyl
          </span>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-retro-rust">
          <CheckCircle2 size={22} />
          <span className="font-display text-lg font-bold">Pedido confirmado</span>
        </div>

        <p className="font-display mt-3 text-center text-5xl font-black tracking-tight text-deep-grove">
          #{orderId}
        </p>
        <p className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-deep-grove/50">
          Número de orden
        </p>

        <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-white/70 p-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                <Image src={item.imageUrl} alt={item.album} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] uppercase text-deep-grove/50">
                  {item.artist}
                </p>
                <p className="truncate font-display text-sm font-semibold text-deep-grove">
                  {item.album}
                </p>
              </div>
              <p className="flex-shrink-0 text-xs text-deep-grove/60">
                {item.quantity} × {formatQuetzales(item.price)}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-deep-grove/10 pt-2">
            <span className="text-sm font-semibold text-deep-grove">Total</span>
            <span className="font-display text-base font-bold text-retro-rust">
              {formatQuetzales(total)}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-golden-hour/15 p-3 text-center">
          <p className="text-sm font-bold text-deep-grove">
            Guarda esta captura
          </p>
          <p className="mt-1 text-xs text-deep-grove/70">
            La necesitas junto a tu teléfono o correo para rastrear el pedido
            en /rastreo
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-deep-grove px-5 py-2.5 text-sm font-semibold text-vintage-cream shadow-sm transition hover:bg-deep-grove-light disabled:opacity-60"
      >
        <Download size={16} />
        {downloading ? "Descargando..." : "Descargar comprobante"}
      </button>
    </div>
  );
}
