# VRS SaaS

A multi-tenant HR SaaS application.

## Structure

- `apps/api`: Express.js backend
- `apps/web`: React (Vite) frontend
- `apps/worker`: BullMQ job processor
- `packages/ui`: Shared React components (shadcn/ui)
- `packages/config`: ESLint, Prettier, TSConfig configurations
- `packages/types`: Shared types and Zod schemas

## Development

To run all applications in development mode:

```sh
pnpm dev
```
