# HR SaaS (Stage 15)
Polish: theming, accessibility, docs.

## Branding (per-tenant)
- `GET  /v1/branding` → current theme.
- `PUT  /v1/branding` → update. RBAC: `THEME_MANAGE` (OWNER, HR_ADMIN).
- Prisma: `TenantBranding` with colors, brandName, logoUrl, scheme.

## Web Theming
- CSS variables: `--color-primary`, `--color-accent`, `--sidebar-bg`, `--sidebar-text`.
- `applyBranding()` sets variables + toggles `dark` class when scheme is DARK or matches system.
- Settings page: `/settings/branding`.

## Accessibility
- Skip link → jumps to `#main-content`.
- Route announcements via `aria-live`.
- Focus-visible outlines use primary color.
- Reduced motion respected.

## Dev
```
pnpm i
pnpm --filter @hr/api prisma:generate
pnpm --filter @hr/api prisma:migrate --name branding_core
docker compose up -d
pnpm -w run build
pnpm --filter @hr/api test
pnpm --filter @hr/api dev
pnpm --filter @hr/web dev
```

## DoD
- Update branding changes the UI instantly.
- Route changes announced; focus moves to main.
- Lint/build/tests pass.
