-- RateLimitEvent was added after the RLS-enabling migration and was missed.
-- The app connects as the table owner via Prisma (DATABASE_URL), which
-- bypasses RLS by default, so this does not affect app behavior. It only
-- closes off Supabase's auto-generated PostgREST data API, which otherwise
-- has no access control on this table for the anon/authenticated roles.
ALTER TABLE "RateLimitEvent" ENABLE ROW LEVEL SECURITY;
