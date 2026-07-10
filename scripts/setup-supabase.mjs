// Crea (si no existen) los buckets de Supabase Storage que usa la app.
// Uso: node scripts/setup-supabase.mjs
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

async function ensureBucket(name, isPublic) {
  const { data: existing } = await supabase.storage.getBucket(name);
  if (existing) {
    console.log(`✓ El bucket "${name}" ya existe.`);
    return;
  }
  const { error } = await supabase.storage.createBucket(name, {
    public: isPublic,
    fileSizeLimit: "5MB",
  });
  if (error) {
    console.error(`✗ No se pudo crear el bucket "${name}":`, error.message);
    process.exit(1);
  }
  console.log(`✓ Bucket "${name}" creado (${isPublic ? "público" : "privado"}).`);
}

await ensureBucket("productos", true);
await ensureBucket("depositos", false);

console.log("Listo.");
