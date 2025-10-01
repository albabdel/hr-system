CREATE TABLE "EmployeeDocument" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "employeeId" UUID NOT NULL,
  "fileId" UUID NOT NULL,
  "title" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "EmployeeDocument_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE,
  CONSTRAINT "EmployeeDocument_employee_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE,
  CONSTRAINT "EmployeeDocument_file_fkey" FOREIGN KEY ("fileId") REFERENCES "FileObject"("id") ON DELETE CASCADE
);

CREATE INDEX "empdoc_emp_idx" ON "EmployeeDocument"("tenantId","employeeId");
CREATE INDEX "empdoc_file_idx" ON "EmployeeDocument"("tenantId","fileId");

-- RLS
ALTER TABLE "EmployeeDocument" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EmployeeDocument" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "empdoc_read" ON "EmployeeDocument";
CREATE POLICY "empdoc_read" ON "EmployeeDocument"
  FOR SELECT USING ("tenantId" = current_setting('app.tenant_id', true)::uuid);
DROP POLICY IF EXISTS "empdoc_write" ON "EmployeeDocument";
CREATE POLICY "empdoc_write" ON "EmployeeDocument"
  FOR ALL USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);
