import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse, HttpError } from '../errors.js';
import { CheckoutCreate, PortalCreate } from '../schemas/billing.js';
import { prisma } from '../db.js';
import { createCheckoutSession, createPortalSession, updateSubscriptionItemQuantity } from '../services/stripe.js';
import { registry } from '../openapi.js';

const router = Router();

registry.registerPath({
  method: 'get', path: '/v1/billing/subscription', tags: ['billing'],
  responses: { 200: { description: 'OK' } }
});
router.get('/subscription', tenantResolver, requireAuth, rbacGuard(Action.BILLING_MANAGE), async (req, res) => {
  const { tenantId } = req.tenant!;
  const sub = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.billingSubscription.findUnique({ where: { tenantId } });
  });
  res.json(sub ?? null);
});

registry.registerPath({
  method: 'post', path: '/v1/billing/checkout/session', tags: ['billing'],
  responses: { 200: { description: 'OK' } }
});
router.post('/checkout/session', tenantResolver, requireAuth, rbacGuard(Action.BILLING_MANAGE), async (req, res) => {
  const body = zParse(CheckoutCreate)(req.body);
  const { tenantId, tenantSlug } = req.tenant!;
  const successUrl = body.successUrl || `${process.env.APP_URL || 'http://localhost:5173'}/billing/success`;
  const cancelUrl = body.cancelUrl || `${process.env.APP_URL || 'http://localhost:5173'}/billing/cancel`;
  const session = await createCheckoutSession({
    tenantId, tenantSlug, plan: body.plan, seats: body.seats, successUrl, cancelUrl
  });
  res.json({ id: session.id, url: (session as any).url });
});

registry.registerPath({
  method: 'post', path: '/v1/billing/portal/session', tags: ['billing'],
  responses: { 200: { description: 'OK' } }
});
router.post('/portal/session', tenantResolver, requireAuth, rbacGuard(Action.BILLING_MANAGE), async (req, res) => {
  const _ = zParse(PortalCreate)(req.body || {});
  const { tenantId } = req.tenant!;
  const sub = await prisma.billingSubscription.findUnique({ where: { tenantId } });
  if (!sub?.stripeCustomerId) throw new HttpError(400, 'NO_CUSTOMER', 'No Stripe customer on file');
  const returnUrl = _.returnUrl || `${process.env.APP_URL || 'http://localhost:5173'}/billing`;
  const session = await createPortalSession(sub.stripeCustomerId, returnUrl);
  res.json({ id: session.id, url: (session as any).url });
});

registry.registerPath({
  method: 'post', path: '/v1/billing/seat-sync', tags: ['billing'],
  responses: { 200: { description: 'OK' } }
});
router.post('/seat-sync', tenantResolver, requireAuth, rbacGuard(Action.BILLING_MANAGE), async (req, res) => {
  const { tenantId } = req.tenant!;
  const updated = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    const seatCount = await tx.user.count({ where: { tenantId } });
    const sub = await tx.billingSubscription.findUnique({ where: { tenantId } });
    if (!sub?.stripeSubscriptionId) return { seatCount, ok: false };
    await updateSubscriptionItemQuantity(sub.stripeSubscriptionId, seatCount);
    await tx.billingSubscription.update({ where: { tenantId }, data: { seats: seatCount } });
    return { seatCount, ok: true };
  });
  res.json(updated);
});

export default router;
