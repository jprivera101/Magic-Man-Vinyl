-- Prisma's own migration-history table lives in the public schema too,
-- so it shows up in the same Supabase RLS audit as the app tables.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
