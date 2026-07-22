-- Enable Row Level Security on every table in the public schema.
-- The app connects as the table owner via Prisma (DATABASE_URL), which
-- bypasses RLS by default, so this does not affect app behavior. It only
-- closes off Supabase's auto-generated PostgREST data API, which otherwise
-- has no access control on these tables for the anon/authenticated roles.
ALTER TABLE "SkuCounter" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Promotion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PriceLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankAccount" ENABLE ROW LEVEL SECURITY;
