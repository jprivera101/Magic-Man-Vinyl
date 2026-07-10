"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPinCheck, Landmark } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { getCartProductsAction, type CartProduct } from "../cart-actions";
import { submitOrderAction, lookupAddressAction, type OrderFormState } from "./actions";
import { formatQuetzales } from "@/lib/format";
import { ImageField } from "@/components/ImageField";
import { SubmitButton } from "@/components/SubmitButton";

const initialState: OrderFormState = {};

export type BankAccountOption = {
  id: string;
  banco: string;
  numeroCuenta: string;
  tipoCuenta: string;
  titular: string;
};

export function CheckoutView({ accounts }: { accounts: BankAccountOption[] }) {
  const { items } = useCart();
  const [products, setProducts] = useState<CartProduct[] | null>(null);
  const [state, formAction] = useActionState(submitOrderAction, initialState);
  const [suggestedAddress, setSuggestedAddress] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    accounts[0]?.id ?? null,
  );
  const router = useRouter();
  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) ?? accounts[0] ?? null;

  const nombreRef = useRef<HTMLInputElement>(null);
  const apellidoRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const direccionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getCartProductsAction(items.map((i) => i.productId)).then(setProducts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    if (products !== null && products.length === 0 && items.length === 0) {
      router.replace("/carrito");
    }
  }, [products, items.length, router]);

  async function checkSavedAddress() {
    const nombre = nombreRef.current?.value ?? "";
    const apellido = apellidoRef.current?.value ?? "";
    const telefono = telefonoRef.current?.value ?? "";
    const email = emailRef.current?.value ?? "";
    if (!nombre.trim() || !apellido.trim() || (!telefono.trim() && !email.trim())) {
      setSuggestedAddress(null);
      return;
    }
    const result = await lookupAddressAction(nombre, apellido, telefono, email);
    setSuggestedAddress(result?.direccion ?? null);
  }

  function useSuggestedAddress() {
    if (suggestedAddress && direccionRef.current) {
      direccionRef.current.value = suggestedAddress;
    }
    setSuggestedAddress(null);
  }

  if (products === null) {
    return <p className="py-16 text-center text-sm text-deep-grove/50">Cargando...</p>;
  }

  const lines = items
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? { ...line, product } : null;
    })
    .filter((l): l is { productId: string; quantity: number; product: CartProduct } => Boolean(l));

  const total = lines.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0);
  const itemsJson = JSON.stringify(items);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white/60 p-3">
        <div className="flex items-center justify-between px-1 pb-2">
          <p className="text-sm font-semibold text-deep-grove">Tu pedido</p>
          <Link href="/carrito" className="text-xs font-medium text-retro-rust">
            Editar carrito
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {lines.map(({ productId, quantity, product }) => (
            <div key={productId} className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                <Image src={product.imageUrl} alt={product.album} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs uppercase text-deep-grove/50">{product.artist}</p>
                <p className="truncate text-sm font-semibold text-deep-grove">{product.album}</p>
              </div>
              <p className="flex-shrink-0 text-sm text-deep-grove/70">
                {quantity} × {formatQuetzales(product.price)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-deep-grove/10 px-1 pt-2">
          <span className="text-sm font-semibold text-deep-grove">Total</span>
          <span className="font-display text-lg font-bold text-retro-rust">
            {formatQuetzales(total)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-golden-hour/40 bg-golden-hour/10 p-4">
        <div className="flex items-start gap-3">
          <Landmark className="mt-0.5 flex-shrink-0 text-golden-hour-dark" size={22} />
          <div className="w-full text-sm text-deep-grove">
            <p className="font-semibold">Solo aceptamos pago por depósito bancario</p>

            {accounts.length === 0 && (
              <p className="mt-2 text-deep-grove/70">
                Contáctanos para conocer los datos de depósito.
              </p>
            )}

            {accounts.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedAccountId(account.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      selectedAccount?.id === account.id
                        ? "bg-deep-grove text-vintage-cream"
                        : "bg-white text-deep-grove/70 hover:bg-deep-grove/10"
                    }`}
                  >
                    {account.banco}
                  </button>
                ))}
              </div>
            )}

            {selectedAccount && (
              <dl className="mt-3 space-y-1">
                <div>
                  <dt className="inline text-deep-grove/60">Banco: </dt>
                  <dd className="inline font-medium">{selectedAccount.banco}</dd>
                </div>
                <div>
                  <dt className="inline text-deep-grove/60">No. de cuenta: </dt>
                  <dd className="inline font-medium">{selectedAccount.numeroCuenta}</dd>
                </div>
                {selectedAccount.tipoCuenta && (
                  <div>
                    <dt className="inline text-deep-grove/60">Tipo de cuenta: </dt>
                    <dd className="inline font-medium">{selectedAccount.tipoCuenta}</dd>
                  </div>
                )}
                <div>
                  <dt className="inline text-deep-grove/60">A nombre de: </dt>
                  <dd className="inline font-medium">{selectedAccount.titular}</dd>
                </div>
              </dl>
            )}

            <p className="mt-2 text-deep-grove/70">
              Después de depositar el total, completa el formulario y adjunta
              la foto del comprobante.
            </p>
          </div>
        </div>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="items" value={itemsJson} />
        <input type="hidden" name="bankAccountId" value={selectedAccount?.id ?? ""} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
              Nombre
            </span>
            <input
              ref={nombreRef}
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
              ref={apellidoRef}
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
        <p className="-mt-2 text-xs text-deep-grove/50">
          Un solo nombre y un solo apellido, sin espacios ni signos (ej. Juan,
          María).
        </p>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-deep-grove">Contacto</p>
          <p className="mb-3 text-xs text-deep-grove/60">
            Déjanos al menos un teléfono o un correo — con eso también podrás
            rastrear tu pedido más adelante.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-deep-grove/80">
                Teléfono
              </span>
              <input
                ref={telefonoRef}
                type="tel"
                name="telefono"
                inputMode="numeric"
                maxLength={8}
                pattern="\d{8}"
                placeholder="Ej. 55551234"
                onBlur={checkSavedAddress}
                className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
              />
              <p className="mt-1 text-xs text-deep-grove/50">8 dígitos</p>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-deep-grove/80">
                Correo electrónico
              </span>
              <input
                ref={emailRef}
                type="email"
                name="email"
                placeholder="tucorreo@ejemplo.com"
                onBlur={checkSavedAddress}
                className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
              />
            </label>
          </div>
        </div>

        {suggestedAddress && (
          <div className="rounded-xl bg-golden-hour/10 p-3 text-sm">
            <p className="flex items-center gap-1.5 font-semibold text-deep-grove">
              <MapPinCheck size={14} />
              Ya tenemos una dirección registrada para ti
            </p>
            <p className="mt-1 text-deep-grove/70">¿Quieres usarla?</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={useSuggestedAddress}
                className="rounded-full bg-deep-grove px-3 py-1.5 text-xs font-semibold text-vintage-cream transition hover:bg-deep-grove-light"
              >
                Sí, usarla
              </button>
              <button
                type="button"
                onClick={() => setSuggestedAddress(null)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-deep-grove/60 transition hover:bg-deep-grove/10"
              >
                No, es otra dirección
              </button>
            </div>
          </div>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-deep-grove">
            Dirección de envío
          </span>
          <textarea
            ref={direccionRef}
            name="direccion"
            required
            rows={3}
            placeholder="Dirección completa, zona, municipio y departamento"
            className="w-full rounded-xl border border-deep-grove/20 bg-white px-4 py-3 text-base text-deep-grove shadow-sm focus:border-retro-rust focus:outline-none focus:ring-1 focus:ring-retro-rust"
          />
        </label>

        <ImageField
          name="comprobante"
          label="Foto del comprobante de depósito"
          helpText="JPG, PNG o WEBP, máximo 5MB."
          required
        />

        {state.error && (
          <p className="rounded-xl bg-retro-rust/10 px-4 py-3 text-sm font-medium text-retro-rust-dark">
            {state.error}
          </p>
        )}

        <SubmitButton pendingText="Enviando pedido...">
          Enviar pedido
        </SubmitButton>
      </form>
    </div>
  );
}
