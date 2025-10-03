import express from 'express';
import { prisma } from '../../db.js';
import { verifyStripeSignature } from '../../services/stripe.js';

// Use raw body for Stripe
const router = express.Router({});

router.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event: any;
  try {
    event = verifyStripeSignature(req.body, req.headers['stripe-signature'] as string | undefined) || JSON.parse(req.body.toString('utf8'));
  } catch (e: any) {
    return res.status(400).json({ error: 'INVALID_SIGNATURE' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        const tenantId = s.metadata?.tenantId as string;
        const plan = (s.metadata?.plan || 'BASIC') as any;
        const seats = Number(s.metadata?.seats || 1);
        await prisma.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
          await tx.billingSubscription.upsert({
            where: { tenantId },
            update: {
              plan, seats,
              stripeCustomerId: s.customer as string | null,
              stripeSubscriptionId: s.subscription as string | null,
              status: 'ACTIVE'
            },
            create: {
              tenantId, plan, seats,
              stripeCustomerId: s.customer as string | null,
              stripeSubscriptionId: s.subscription as string | null,
              status: 'ACTIVE'
            }
          });
        });
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object;
        const stripeSubId = sub.id as string;
        const status = (sub.status as string || 'active').toUpperCase().replace('-', '_');
        const custId = sub.customer as string;
        const periodStart = new Date((sub.current_period_start as number) * 1000);
        const periodEnd = new Date((sub.current_period_end as number) * 1000);

        // Find by stripeSubscriptionId (we don't get tenantId in all events)
        await prisma.billingSubscription.updateMany({
          where: { stripeSubscriptionId: stripeSubId },
          data: {
            status: status as any,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            stripeCustomerId: custId,
            cancelAtPeriodEnd: !!sub.cancel_at_period_end
          }
        });
        break;
      }
      case 'invoice.payment_failed': {
        const subId = event.data.object.subscription as string;
        await prisma.billingSubscription.updateMany({ where: { stripeSubscriptionId: subId }, data: { delinquent: true, status: 'PAST_DUE' } });
        break;
      }
      case 'invoice.payment_succeeded': {
        const subId = event.data.object.subscription as string;
        await prisma.billingSubscription.updateMany({ where: { stripeSubscriptionId: subId }, data: { delinquent: false } });
        break;
      }
      case 'customer.subscription.deleted': {
        const subId = event.data.object.id as string;
        await prisma.billingSubscription.updateMany({ where: { stripeSubscriptionId: subId }, data: { status: 'CANCELED' } });
        break;
      }
      default:
        // no-op
        break;
    }
    res.json({ received: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'WEBHOOK_ERROR', message: e.message });
  }
});

export default router;
