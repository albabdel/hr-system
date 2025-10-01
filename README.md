# HR SaaS (Stage 5)
Typed RBAC with permission matrix, middleware, and tests.

## What this adds
- `Action`, `Scope`, `Permission` types.
- Matrix for OWNER, HR_ADMIN, MANAGER, EMPLOYEE.
- `rbacGuard(action)` middleware.
- Test shortcut for tenant: header `x-tenant-test` in `NODE_ENV=test`.
- Probe routes under `/v1/probe` to verify guards.

## Try it
- Start API: `pnpm --filter @hr/api dev`
- Call with an OWNER token to:
  - `GET /v1/probe/employee/:userId`
  - `POST /v1/probe/employee`
  - `DELETE /v1/probe/employee/:id`

## Tests
- `pnpm --filter @hr/api test`
- Covers:
  - EMPLOYEE: can read self only.
  - MANAGER: read OK, create/delete blocked.
  - HR_ADMIN: create/delete OK.
  - OWNER: all OK.
