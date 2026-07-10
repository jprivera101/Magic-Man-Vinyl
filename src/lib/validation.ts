import { z } from "zod";

export const CONDICIONES_VINILO = [
  "Nuevo / sellado",
  "Como nuevo",
  "Buen estado",
  "Estado aceptable",
] as const;

export const productSchema = z.object({
  artist: z.string().trim().min(1, "El artista es obligatorio").max(200),
  album: z.string().trim().min(1, "El álbum es obligatorio").max(200),
  price: z.coerce
    .number({ message: "El precio debe ser un número" })
    .positive("El precio debe ser mayor a 0")
    .max(100000, "Ese precio parece demasiado alto"),
  cost: z.coerce
    .number({ message: "El costo debe ser un número" })
    .min(0, "El costo no puede ser negativo")
    .max(100000, "Ese costo parece demasiado alto")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  genre: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v ? v : undefined)),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  condition: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => (v ? v : undefined)),
  units: z.coerce
    .number({ message: "Las unidades deben ser un número" })
    .int("Las unidades deben ser un número entero")
    .min(1, "Debe haber al menos 1 unidad")
    .max(9999, "Esa cantidad parece demasiado alta"),
});

export type ProductInput = z.infer<typeof productSchema>;

const emptyToUndefined = (v: string) => (v.trim() ? v.trim() : undefined);

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü]{2,40}$/;
const nameField = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => NAME_REGEX.test(v), {
      message: `${label}: una sola palabra, sin espacios ni signos (ej. Juan, María)`,
    });

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const cartItemsSchema = z
  .array(cartItemSchema)
  .min(1, "El carrito está vacío");

export type CartItemInput = z.infer<typeof cartItemSchema>;

export const orderSchema = z
  .object({
    nombre: nameField("Nombre"),
    apellido: nameField("Apellido"),
    telefono: z
      .string()
      .trim()
      .transform(emptyToUndefined)
      .optional()
      .refine((v) => !v || /^\d{8}$/.test(v), {
        message: "El teléfono debe tener 8 dígitos (Guatemala)",
      }),
    email: z
      .string()
      .trim()
      .transform(emptyToUndefined)
      .optional()
      .refine((v) => !v || z.string().email().safeParse(v).success, {
        message: "Ingresa un correo válido",
      }),
    direccion: z
      .string()
      .trim()
      .min(5, "Ingresa una dirección de envío completa")
      .max(500),
    bankAccountId: z
      .string()
      .trim()
      .transform(emptyToUndefined)
      .optional(),
  })
  .refine((data) => Boolean(data.telefono) || Boolean(data.email), {
    message: "Déjanos al menos un teléfono o un correo para contactarte",
    path: ["telefono"],
  });

export type OrderInput = z.infer<typeof orderSchema>;

export const customOrderClientSchema = z
  .object({
    nombre: nameField("Nombre"),
    apellido: nameField("Apellido"),
    telefono: z
      .string()
      .trim()
      .transform(emptyToUndefined)
      .optional()
      .refine((v) => !v || /^\d{8}$/.test(v), {
        message: "El teléfono debe tener 8 dígitos (Guatemala)",
      }),
    email: z
      .string()
      .trim()
      .transform(emptyToUndefined)
      .optional()
      .refine((v) => !v || z.string().email().safeParse(v).success, {
        message: "Ingresa un correo válido",
      }),
    direccion: z
      .string()
      .trim()
      .min(5, "Ingresa una dirección de envío completa")
      .max(500),
  })
  .refine((data) => Boolean(data.telefono) || Boolean(data.email), {
    message: "Déjanos al menos un teléfono o un correo para contactar al cliente",
    path: ["telefono"],
  });

export type CustomOrderClientInput = z.infer<typeof customOrderClientSchema>;

export const customOrderItemSchema = z.object({
  artist: z.string().trim().min(1, "Falta el artista").max(200),
  album: z.string().trim().min(1, "Falta el álbum").max(200),
  price: z.coerce
    .number({ message: "El precio debe ser un número" })
    .positive("El precio debe ser mayor a 0")
    .max(100000, "Ese precio parece demasiado alto"),
  cost: z.coerce
    .number({ message: "El costo debe ser un número" })
    .min(0, "El costo no puede ser negativo")
    .max(100000, "Ese costo parece demasiado alto")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const customOrderItemsSchema = z
  .array(customOrderItemSchema)
  .min(1, "Agrega al menos un vinilo");

export type CustomOrderItemInput = z.infer<typeof customOrderItemSchema>;

export const customOrderEditSchema = z.object({
  direccion: z
    .string()
    .trim()
    .min(5, "Ingresa una dirección de envío completa")
    .max(500),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        productId: z.string().min(1),
        price: z.coerce
          .number({ message: "El precio debe ser un número" })
          .positive("El precio debe ser mayor a 0")
          .max(100000, "Ese precio parece demasiado alto"),
        cost: z.coerce
          .number({ message: "El costo debe ser un número" })
          .min(0, "El costo no puede ser negativo")
          .max(100000, "Ese costo parece demasiado alto")
          .optional()
          .or(z.literal("").transform(() => undefined)),
      }),
    )
    .min(1, "Faltan los vinilos del pedido"),
});

export type CustomOrderEditInput = z.infer<typeof customOrderEditSchema>;

export const trackOrderSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(3, "Ingresa el código de tu orden")
    .transform((v) => v.toUpperCase()),
  contacto: z
    .string()
    .trim()
    .min(3, "Ingresa el teléfono o correo que usaste en el pedido"),
});

export type TrackOrderInput = z.infer<typeof trackOrderSchema>;

export const bankAccountSchema = z.object({
  banco: z.string().trim().min(1, "El banco es obligatorio").max(200),
  numeroCuenta: z.string().trim().min(1, "El número de cuenta es obligatorio").max(100),
  tipoCuenta: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((v) => v ?? ""),
  titular: z.string().trim().min(1, "El nombre del titular es obligatorio").max(200),
});

export type BankAccountInput = z.infer<typeof bankAccountSchema>;
