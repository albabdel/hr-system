-- Enums
DO $$ BEGIN
  CREATE TYPE "PayrollFrequency" AS ENUM ('MONTHLY','BIWEEKLY','WEEKLY','CUSTOM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT','REVIEW','APPROVED','FINALIZED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "PayrollCalendar"(
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "frequency" "PayrollFrequency" NOT NULL,
  "dayOfMonth" INT,
  "cutoffOffsetDays" INT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "pc_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "pc_name_idx" ON "PayrollCalendar"("tenantId","name");

CREATE TABLE IF NOT EXISTS "PayrollRun"(
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "calendarId" UUID NOT NULL,
  "periodStart" TIMESTAMP NOT NULL,
  "periodEnd" TIMESTAMP NOT NULL,
  "status" "PayrollRunStatus" NOT NULL DEFAULT 'DRAFT',
  "totals" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "pr_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "pr_calendar_fkey" FOREIGN KEY ("calendarId") REFERENCES "PayrollCalendar"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "pr_status_idx" ON "PayrollRun"("tenantId","status");
CREATE INDEX IF NOT EXISTS "pr_period_idx" ON "PayrollRun"("tenantId","periodStart","periodEnd");

CREATE TABLE IF NOT EXISTS "Payslip"(
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "runId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "gross" NUMERIC NOT NULL DEFAULT 0,
  "taxes" NUMERIC NOT NULL DEFAULT 0,
  "net" NUMERIC NOT NULL DEFAULT 0,
  "pdfFileId" UUID,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "ps_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "ps_run_fkey" FOREIGN KEY ("runId") REFERENCES "PayrollRun"("id") ON DELETE CASCADE,
  CONSTRAINT "ps_emp_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
  CONSTRAINT "ps_file_fkey" FOREIGN KEY ("pdfFileId") REFERENCES "FileObject"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "ps_run_idx" ON "Payslip"("tenantId","runId");
CREATE INDEX IF NOT EXISTS "ps_emp_idx" ON "Payslip"("tenantId","employeeId");

-- RLS
ALTER TABLE "PayrollCalendar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PayrollCalendar" FORCE ROW LEVEL SECURITY;
CREATE POLICY "pc_rw" ON "PayrollCalendar"
  FOR ALL USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE "PayrollRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PayrollRun" FORCE ROW LEVEL SECURITY;
CREATE POLICY "pr_rw" ON "PayrollRun"
  FOR ALL USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE "Payslip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payslip" FORCE ROW LEVEL SECURITY;
CREATE POLICY "ps_rw" ON "Payslip"
  FOR ALL USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);
