# HR SaaS (Stage 3)
Postgres RLS + policies for tenant isolation.

## What this adds
- RLS enabled and forced on User, Department, Employee, FileObject, AuditLog.
- Policies require `current_setting('app.tenant_id')` to match `tenantId`.
- Boot check: aborts if RLS is misconfigured.
- Smoke script that proves reads/writes are scoped.

## Commands
```bash
# Create migration
pnpm --filter @hr/api prisma:migrate --name rls_init

# Verify app boots and RLS is verified
pnpm --filter @hr/api dev

# Run smoke test (after Stage 2 seed)
pnpm --filter @hr/api rls:smoke
```

## Expected

* API logs: “RLS verified for tables: User, Department, Employee, FileObject, AuditLog”.
* Smoke prints: “RLS smoke passed: same-tenant read ok, cross-tenant blocked.”
