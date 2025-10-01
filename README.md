# HR SaaS (Stage 1)
- Monorepo scaffold with API, Web, Worker.
- Docker services: Postgres, Redis, MinIO, Mailhog.

## Dev quickstart
1) pnpm i
2) docker compose up -d
3) pnpm -w run dev
- API: http://localhost:3000/healthz
- Web: http://localhost:5173
- Mailhog: http://localhost:8025
- MinIO: http://localhost:9001 (minio / minio123)
