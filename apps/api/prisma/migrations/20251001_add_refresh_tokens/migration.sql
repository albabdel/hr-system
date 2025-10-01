CREATE TABLE "RefreshToken" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "revoked" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "expiresAt" TIMESTAMP NOT NULL
);

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_tenant_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

CREATE INDEX "RefreshToken_tenant_user_idx" ON "RefreshToken"("tenantId","userId");

-- RLS for refresh tokens (tenant scoped)
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "refresh_read_policy" ON "RefreshToken";
CREATE POLICY "refresh_read_policy" ON "RefreshToken"
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid);
DROP POLICY IF EXISTS "refresh_write_policy" ON "RefreshToken";
CREATE POLICY "refresh_write_policy" ON "RefreshToken"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);
