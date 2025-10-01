-- Enable Row Level Security and policies for tenant-scoped tables.
-- Tables: "User", "Department", "Employee", "FileObject", "AuditLog"

-- Helper: ensure extension for gen_random_uuid if ever needed downstream (no-op if exists)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- User
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_read_policy" ON "User";
CREATE POLICY "user_read_policy" ON "User"
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS "user_write_policy" ON "User";
CREATE POLICY "user_write_policy" ON "User"
  FOR ALL
  TO PUBLIC
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

-- Department
ALTER TABLE "Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Department" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "department_read_policy" ON "Department";
CREATE POLICY "department_read_policy" ON "Department"
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS "department_write_policy" ON "Department";
CREATE POLICY "department_write_policy" ON "Department"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

-- Employee
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "employee_read_policy" ON "Employee";
CREATE POLICY "employee_read_policy" ON "Employee"
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS "employee_write_policy" ON "Employee";
CREATE POLICY "employee_write_policy" ON "Employee"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

-- FileObject
ALTER TABLE "FileObject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FileObject" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "file_read_policy" ON "FileObject";
CREATE POLICY "file_read_policy" ON "FileObject"
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS "file_write_policy" ON "FileObject";
CREATE POLICY "file_write_policy" ON "FileObject"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

-- AuditLog
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_read_policy" ON "AuditLog";
CREATE POLICY "audit_read_policy" ON "AuditLog"
  FOR SELECT
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid);

DROP POLICY IF EXISTS "audit_write_policy" ON "AuditLog";
CREATE POLICY "audit_write_policy" ON "AuditLog"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

-- Note:
-- current_setting('app.tenant_id', true) returns NULL if not set.
-- The cast to uuid will fail if NULL; that is intentional to prevent access when unset.
-- API middleware will set it each request in Stage 4.
