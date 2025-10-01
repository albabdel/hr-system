# HR SaaS (Stage 8)
Files + signed URLs + employee documents.

## New endpoints
- `POST /v1/files/sign-upload` → `{ uploadUrl, fileId, objectKey }`
- `GET /v1/files/:id/signed-url` → `{ url, contentType, filename }`
- `POST /v1/employees/:id/documents` → attach file to employee
- `GET /v1/employees/:id/documents` → list attachments

## Env
Set in `apps/api/.env` or docker-compose:
```
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=minio
STORAGE_SECRET_KEY=minio123
STORAGE_BUCKET=hr-dev
STORAGE_USE_TLS=false
```

## Dev quickstart
```bash
pnpm i
pnpm --filter @hr/api prisma:migrate --name employee_documents
docker compose up -d
pnpm --filter @hr/api dev
```

## Upload flow
1) Call `POST /v1/files/sign-upload` with filename, contentType, sizeBytes.
2) PUT the bytes to `uploadUrl` with `Content-Type` header.
3) `POST /v1/employees/:id/documents` with `fileId` to link file.
4) Get a viewer URL: `GET /v1/files/:id/signed-url`.

Worker logs mark file as scanned (stub). Real scanning can replace it later.
