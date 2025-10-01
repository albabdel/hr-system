# HR SaaS (Stage 2)
Core database schema with Prisma. First migration and seed.

## Env
- Copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL` if needed.

## Commands
```bash
pnpm i
pnpm --filter @hr/api prisma:generate
pnpm --filter @hr/api prisma:migrate --name init
pnpm --filter @hr/api seed
```

## Verify

```bash
curl http://localhost:3000/healthz
# Expect: {"ok":true}
```
