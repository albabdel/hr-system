# HR SaaS (Stage 11)
Payroll core: calendars, runs, payslips, PDF stub.

## Endpoints
- Calendars
  - `POST /v1/payroll/calendars`
  - `GET  /v1/payroll/calendars`
- Runs
  - `POST /v1/payroll/runs`
  - `POST /v1/payroll/runs/:id/calc`
  - `POST /v1/payroll/runs/:id/submit`
  - `POST /v1/payroll/runs/:id/approve`
  - `POST /v1/payroll/runs/:id/finalize`
  - `GET  /v1/payroll/runs/:id`
- Payslips
  - `GET  /v1/payslips/:id/pdf-url`

## Notes
- RLS enforced for all payroll tables.
- RBAC uses `PAYROLL_RUN` for all payroll endpoints.
- `NODE_ENV=test` calculates payslips synchronously for deterministic tests.
- Worker jobs:
  - `payrollCalc`: creates payslips.
  - `payslipPdf`: creates PDFs and uploads to S3 (stub).

## Dev
```
pnpm i
pnpm --filter @hr/api prisma:generate
pnpm --filter @hr/api prisma:migrate --name payroll_core
docker compose up -d
pnpm --filter @hr/api dev
pnpm --filter @hr/worker dev
```

## Tests
```
pnpm --filter @hr/api test
```
