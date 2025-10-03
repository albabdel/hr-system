Here’s what broke and how to fix it fast.

## What went wrong

* Your repo is a **Firebase Studio Next.js starter**, not the PERN monorepo we’ve been building for. The README literally says “This is a NextJS starter in Firebase Studio.” ([GitHub][1])
* Your CI workflow is set up for **pnpm workspaces** (`pnpm -w run …`), but the repo is a **single-app Next.js** project with **npm** (you have a `package-lock.json`, no workspace file). The CI run failed with `pnpm recursive install` and `pnpm store prune` errors. ([GitHub][2])
* No `apps/api`, `apps/web`, `apps/worker`, no `pnpm-workspace.yaml`, no Docker compose. The root file list is typical Next (`src/`, `public/`, `next.config.ts`, `tailwind.config.ts`) and the README mentions Firebase Studio. That’s why the “monorepo” commands you tried don’t work. ([GitHub][1])
* CI currently does: install pnpm → `pnpm -w run lint/typecheck/test/build`. That will always fail in this repo. ([GitHub][3])

## Fix now (minimal, gets the app running)

Do this first. We’ll migrate to the monorepo after CI is green.

### Copy-paste into Firebase Studio

```
# FILE: .github/workflows/ci.yml
name: ci
on:
  push:
    branches: ["**"]
  pull_request:
    branches: ["**"]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install
        run: npm ci

      - name: Typecheck
        run: npx tsc -p tsconfig.json --noEmit

      - name: Lint (if present)
        run: npm run lint --if-present

      - name: Build
        run: npm run build
```

### Local sanity check

* Node 20: `node -v` → v20.x
* Fresh deps: `rm -rf node_modules .next && npm ci`
* Start dev: `npm run dev` → open [http://localhost:3000](http://localhost:3000)
* If it still won’t boot, run: `npm run build` then `npm start` and share the first 30 lines of the error.

## Then pick a path

**A) Keep this repo as Web only (Next.js) and create a new repo for the PERN API/worker**

* Fastest. Keep Firebase Hosting for the web. Put Express/Prisma/Redis in a separate repo and deploy API/worker on Render/Fly/Cloud Run.
* We wire the web to the API via `API_URL` later.

**B) Convert this repo into the monorepo**

* Move current Next app into `apps/web/`.
* Add `apps/api`, `apps/worker`, `packages/*`, `pnpm-workspace.yaml`, and Docker stack.
* Replace npm with pnpm.
* Heavier change, but aligns with our stages.

Tell me A or B and I’ll generate the exact Firebase Studio patch set for that choice, including file moves, workspace config, and updated scripts.

[1]: https://github.com/albabdel/hr-system.git "GitHub - albabdel/hr-system"
[2]: https://github.com/albabdel/hr-system/actions/runs/18228863242 "--- · albabdel/hr-system@ba3239e · GitHub"
[3]: https://github.com/albabdel/hr-system/actions/runs/18228863242/workflow "--- · albabdel/hr-system@ba3239e  · GitHub"
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
