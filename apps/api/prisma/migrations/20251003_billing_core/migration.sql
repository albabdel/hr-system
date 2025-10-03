DO $$ BEGIN
  CREATE TYPE "PlanCode" AS ENUM ('BASIC','PRO','ENTERPRISE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM ('INCOMPLETE','TRIALING','ACTIVE','PAST_DUE','CANCELED','UNPAID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "BillingSubscription"(
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL UNIQUE,
  "plan" "PlanCode" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  "seats" INT NOT NULL DEFAULT 1,
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "currentPeriodStart" TIMESTAMP,
  "currentPeriodEnd" TIMESTAMP,
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT FALSE,
  "delinquent" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "BillingSubscription_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

ALTER TABLE "BillingSubscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BillingSubscription" FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "bs_rw" ON "BillingSubscription"
  FOR ALL USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);
