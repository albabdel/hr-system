-- Employee termination date
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "terminatedAt" TIMESTAMP NULL;

-- ExportJob enum + table
DO $$ BEGIN
  CREATE TYPE "ExportJobStatus" AS ENUM ('QUEUED','RUNNING','DONE','ERROR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ExportJob"(
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "params" JSONB,
  "status" "ExportJobStatus" NOT NULL DEFAULT 'QUEUED',
  "fileId" UUID,
  "error" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "ExportJob_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "ExportJob_file_fkey" FOREIGN KEY ("fileId") REFERENCES "FileObject"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "exportjob_idx" ON "ExportJob"("tenantId","type","status");

-- RLS
ALTER TABLE "ExportJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExportJob" FORCE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "export_rw" ON "ExportJob"
  FOR ALL USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

-- Materialized views (scoped by tenantId in queries)
DROP MATERIALIZED VIEW IF EXISTS mv_headcount_daily;
CREATE MATERIALIZED VIEW mv_headcount_daily AS
WITH days AS (
  SELECT d::date AS day
  FROM generate_series(CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE, INTERVAL '1 day') AS g(d)
)
SELECT t.id AS tenant_id,
       d.day,
       (
         SELECT COUNT(*) FROM "Employee" e
         WHERE e."tenantId" = t.id
           AND (e."hiredAt" IS NULL OR e."hiredAt"::date <= d.day)
           AND (e."terminatedAt" IS NULL OR e."terminatedAt"::date > d.day)
           AND e."status" = 'ACTIVE'
       ) AS active_count
FROM "Tenant" t
CROSS JOIN days d;

CREATE INDEX IF NOT EXISTS mv_headcount_daily_idx ON mv_headcount_daily(tenant_id, day);

DROP MATERIALIZED VIEW IF EXISTS mv_payroll_cost_monthly;
CREATE MATERIALIZED VIEW mv_payroll_cost_monthly AS
SELECT ps."tenantId" AS tenant_id,
       date_trunc('month', pr."periodEnd")::date AS month,
       SUM(ps.gross)::numeric AS gross_total,
       SUM(ps.taxes)::numeric AS tax_total,
       SUM(ps.net)::numeric   AS net_total
FROM "Payslip" ps
JOIN "PayrollRun" pr ON pr.id = ps."runId"
GROUP BY 1,2;

CREATE INDEX IF NOT EXISTS mv_payroll_cost_monthly_idx ON mv_payroll_cost_monthly(tenant_id, month);
