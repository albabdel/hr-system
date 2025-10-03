# HR SaaS (Stage 13)
Billing & Payments with Stripe.

## Endpoints
- `GET  /v1/billing/subscription`
- `POST /v1/billing/checkout/session` { plan, seats }
- `POST /v1/billing/portal/session`
- `POST /v1/billing/seat-sync`
- `POST /webhooks/stripe` (raw body)

## Plans (code-level)
- BASIC: recruiting
- PRO: recruiting, LMS, analytics
- ENTERPRISE: + payroll, advanced_exports

## Notes
- Tests run without live Stripe:
  - Signature verification is skipped in `NODE_ENV=test`.
  - Checkout/Portal return stub URLs.
- Seat sync sets subscription quantity to current user count.
- Webhook provisions `BillingSubscription` and updates status/delinquency.

## Dev
```
pnpm i
pnpm --filter @hr/api prisma:generate
pnpm --filter @hr/api prisma:migrate --name billing_core
docker compose up -d
pnpm --filter @hr/api dev
```

## DoD
- Checkout session returns URL.
- Webhook creates/updates subscription.
- Seat sync updates seats and persists.
- RBAC: only OWNER/HR_ADMIN can manage billing.
- Lint/typecheck/tests pass.
