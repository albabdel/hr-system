# HR SaaS (Stage 6)
Employees API vertical slice.

## Endpoints
- `GET /v1/employees?cursor&limit&search&departmentId&status`
- `POST /v1/employees`
- `GET /v1/employees/:id`
- `PATCH /v1/employees/:id`
- `DELETE /v1/employees/:id`

## Notes
- RLS enforced; every handler sets `app.tenant_id` in a transaction.
- RBAC required: read/create/update/delete.
- Audit logs on CUD with before/after.
- Rate limits on writes.

## Try
- Swagger UI: `http://localhost:3000/docs`
- Seed adds ~40 employees for pagination.
