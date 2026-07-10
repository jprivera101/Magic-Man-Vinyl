import { createClient } from "@supabase/supabase-js";

export const PRODUCTS_BUCKET = "productos";
export const DEPOSITS_BUCKET = "depositos";

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
