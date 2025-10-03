# HR SaaS (Stage 12)
Analytics dashboards + CSV exports.

## New endpoints
- `GET  /v1/analytics/headcount?from&to&groupBy=day|month`
- `GET  /v1/analytics/payroll-cost?from&to&groupBy=month`
- `POST /v1/analytics/exports` → create export job
- `GET  /v1/analytics/exports/:id` → job status
- `POST /v1/analytics/refresh` → refresh MVs
- Use `GET /v1/files/:id/signed-url` to download CSV once job is DONE.

## Materialized views
- `mv_headcount_daily` (last 365 days): active employees per day.
- `mv_payroll_cost_monthly`: sums payslip totals by month.

## Web
- `/analytics` shows headcount and payroll charts.
- Export buttons create CSV jobs and download when ready.

## Dev
```
pnpm i
pnpm --filter @hr/api prisma:generate
pnpm --filter @hr/api prisma:migrate --name analytics_core
docker compose up -d
pnpm --filter @hr/api dev
pnpm --filter @hr/worker dev
pnpm --filter @hr/web dev
```

## DoD
- Charts load for seeded data.
- Export job produces CSV in S3; downloadable via signed URL.
- MVs refresh via worker.
- Lint/build/tests pass.
