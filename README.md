# HR SaaS (Stage 4)
Express API with tenant resolution, JWT auth, Zod validation, and OpenAPI docs.

## Endpoints
- POST `/auth/register-tenant`
- POST `/auth/login` (requires `x-tenant-id` header or subdomain)
- POST `/auth/refresh` (requires tenant)
- POST `/auth/invite` (requires access token with OWNER or HR_ADMIN)

## Docs
- Swagger UI: `http://localhost:3000/docs`
- JSON spec: `http://localhost:3000/openapi.json`

## Notes
- For tenant-scoped queries we run `set_config('app.tenant_id', ...)` inside a Prisma transaction per request/route.
- Seeded OWNER uses a legacy sha256 hash; login accepts it until you re-seed with bcrypt.
