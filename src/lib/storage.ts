import "server-only";
import { getSupabaseAdmin, PRODUCTS_BUCKET, DEPOSITS_BUCKET } from "@/lib/supabase";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class UploadError extends Error {}

function validateImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError("Formato de imagen no válido. Usa JPG, PNG o WEBP.");
  }
  if (file.size > MAX_SIZE) {
    throw new UploadError("La imagen no puede pesar más de 5MB.");
  }
}

function extFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

/** Sube la foto de un vinilo al bucket público y devuelve su URL pública. */
export async function uploadProductImage(file: File): Promise<string> {
  validateImage(file);
  const supabase = getSupabaseAdmin();
  const path = `${crypto.randomUUID()}.${extFromType(file.type)}`;
  const { error } = await supabase.storage
    .from(PRODUCTS_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new UploadError(error.message);
  const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Elimina una foto de producto dado su URL pública. */
export async function deleteProductImage(imageUrl: string) {
  const supabase = getSupabaseAdmin();
  const path = imageUrl.split(`/${PRODUCTS_BUCKET}/`).pop();
  if (!path) return;
  await supabase.storage.from(PRODUCTS_BUCKET).remove([path]);
}

/** Sube el comprobante de depósito al bucket privado y devuelve su ruta interna. */
export async function uploadDepositImage(file: File): Promise<string> {
  validateImage(file);
  const supabase = getSupabaseAdmin();
  const path = `${crypto.randomUUID()}.${extFromType(file.type)}`;
  const { error } = await supabase.storage
    .from(DEPOSITS_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) throw new UploadError(error.message);
  return path;
}

/** Genera una URL firmada temporal para que el admin vea un comprobante de depósito. */
export async function getDepositSignedUrl(path: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(DEPOSITS_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) throw new UploadError(error.message);
  return data.signedUrl;
}
