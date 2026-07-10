"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";

export function ImageField({
  name,
  label,
  helpText,
  required = false,
  defaultPreviewUrl,
}: {
  name: string;
  label: string;
  helpText?: string;
  required?: boolean;
  defaultPreviewUrl?: string;
}) {
  const [preview, setPreview] = useState<string | null>(defaultPreviewUrl ?? null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
        {label}
      </span>
      <div className="relative flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-deep-grove/25 bg-white/60 text-deep-grove/60 transition hover:border-retro-rust/50">
        {preview ? (
          <Image
            src={preview}
            alt="Vista previa"
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <ImagePlus size={28} />
            <span className="text-sm">Toca para elegir una foto</span>
          </div>
        )}
        <input
          type="file"
          name={name}
          accept="image/png,image/jpeg,image/webp"
          required={required}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      {helpText && <p className="mt-1.5 text-xs text-deep-grove/60">{helpText}</p>}
    </label>
  );
}
