-- TimeClock
CREATE TABLE "TimeClock" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "clockIn" TIMESTAMP NOT NULL,
  "clockOut" TIMESTAMP,
  "durationM" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
ALTER TABLE "TimeClock" ADD CONSTRAINT "TimeClock_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
ALTER TABLE "TimeClock" ADD CONSTRAINT "TimeClock_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
CREATE INDEX "tc_user_idx" ON "TimeClock"("tenantId","userId","clockIn");
CREATE INDEX "tc_user_out_idx" ON "TimeClock"("tenantId","userId","clockOut");

-- LeaveType
CREATE TABLE "LeaveType" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "daysPerYear" DOUBLE PRECISION NOT NULL DEFAULT 20,
  "allowHalfDays" BOOLEAN NOT NULL DEFAULT TRUE,
  "allowOnHolidays" BOOLEAN NOT NULL DEFAULT FALSE,
  "requiresApproval" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
ALTER TABLE "LeaveType" ADD CONSTRAINT "LeaveType_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
CREATE UNIQUE INDEX "leavetype_code_per_tenant" ON "LeaveType"("tenantId","code");
CREATE INDEX "leavetype_name_idx" ON "LeaveType"("tenantId","name");

-- LeaveRequest
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING','APPROVED','REJECTED','CANCELED');
CREATE TABLE "LeaveRequest" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "typeId" UUID NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "hours" DOUBLE PRECISION,
  "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "approverId" UUID,
  "decidedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
);
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_type_fkey" FOREIGN KEY ("typeId") REFERENCES "LeaveType"("id") ON DELETE CASCADE;
CREATE INDEX "leavereq_user_range_idx" ON "LeaveRequest"("tenantId","userId","startDate","endDate");
CREATE INDEX "leavereq_status_idx" ON "LeaveRequest"("tenantId","status");

-- HolidayCalendar
CREATE TABLE "HolidayCalendar" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" UUID NOT NULL,
  "date" DATE NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);
ALTER TABLE "HolidayCalendar" ADD CONSTRAINT "HolidayCalendar_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE;
CREATE UNIQUE INDEX "holiday_unique_per_day" ON "HolidayCalendar"("tenantId","date");
CREATE INDEX "holiday_idx" ON "HolidayCalendar"("tenantId","date");

-- RLS
ALTER TABLE "TimeClock" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimeClock" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tc_rw" ON "TimeClock" FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE "LeaveType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaveType" FORCE ROW LEVEL SECURITY;
CREATE POLICY "lt_rw" ON "LeaveType" FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE "LeaveRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaveRequest" FORCE ROW LEVEL SECURITY;
CREATE POLICY "lr_rw" ON "LeaveRequest" FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);

ALTER TABLE "HolidayCalendar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HolidayCalendar" FORCE ROW LEVEL SECURITY;
CREATE POLICY "hc_rw" ON "HolidayCalendar" FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true)::uuid);
