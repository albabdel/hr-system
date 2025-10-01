# HR SaaS (Stage 9)
Time & Attendance, Leave Types & Requests, Holiday Calendar.

## Endpoints

### Time Clock
- `POST /v1/time/clock/in`
- `POST /v1/time/clock/out`
- `GET /v1/time/clock/me?from&to`

### Leave
- `GET  /v1/leave/types`
- `POST /v1/leave/types`
- `PATCH /v1/leave/types/:id`
- `DELETE /v1/leave/types/:id`
- `GET  /v1/leave/requests?userId?status?from?to`
- `POST /v1/leave/requests`
- `POST /v1/leave/requests/:id/approve`
- `POST /v1/leave/requests/:id/reject`
- `POST /v1/leave/requests/:id/cancel`

### Holidays
- `GET  /v1/holidays`
- `POST /v1/holidays`
- `DELETE /v1/holidays/:id`

## Notes
- RLS enforced by setting `app.tenant_id` in every transaction.
- RBAC:
  - Employees clock themselves; create/read/cancel their own leave.
  - Managers/HR/Owner can read tenant-wide and approve/reject.
  - HR/Owner manage leave types and holidays.
- Basic overlap and holiday validation included.
