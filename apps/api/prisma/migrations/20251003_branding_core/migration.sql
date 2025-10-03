DO $$ BEGIN
  CREATE TYPE "ColorScheme" AS ENUM ('SYSTEM','LIGHT','DARK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "TenantBranding"(
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL UNIQUE,
  "brandName" TEXT NOT NULL DEFAULT 'HR SaaS',
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#0ea5e9',
  "accentColor"  TEXT NOT NULL DEFAULT '#22c55e',
  "sidebarBg"    TEXT NOT NULL DEFAULT '#ffffff',
  "sidebarText"  TEXT NOT NULL DEFAULT '#111827',
  "scheme"       "ColorScheme" NOT NULL DEFAULT 'SYSTEM',
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "TenantBranding_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

ALTER TABLE "TenantBranding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TenantBranding" FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "branding_rw" ON "TenantBranding"
  FOR ALL USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);
