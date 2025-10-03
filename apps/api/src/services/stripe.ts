import Stripe from 'stripe';

const isTest = process.env.NODE_ENV === 'test' || !process.env.STRIPE_SECRET;
const stripe = !isTest ? new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2024-06-20' }) : null as any;

const PRICE_IDS: Record<'BASIC'|'PRO'|'ENTERPRISE', string> = {
  BASIC: process.env.STRIPE_PRICE_BASIC || 'price_basic_test',
  PRO: process.env.STRIPE_PRICE_PRO || 'price_pro_test',
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_test'
};

export type Plan = 'BASIC'|'PRO'|'ENTERPRISE';

export async function createCheckoutSession(args: {
  tenantId: string;
  tenantSlug: string;
  plan: Plan;
  seats: number;
  successUrl: string;
  cancelUrl: string;
}) {
  if (isTest) {
    return { id: 'cs_test', url: 'http://example.com/checkout/success' };
  }
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    line_items: [{
      price: PRICE_IDS[args.plan],
      quantity: args.seats
    }],
    metadata: {
      tenantId: args.tenantId,
      plan: args.plan,
      seats: String(args.seats)
    }
  });
  return session;
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  if (isTest) {
    return { id: 'pps_test', url: 'http://example.com/portal' };
  }
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}

export function verifyStripeSignature(rawBody: string | Buffer, sigHeader: string | undefined) {
  if (isTest) return null; // skip verification in test
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2024-06-20' })
    .webhooks.constructEvent(rawBody, sigHeader!, whSecret);
}

export async function updateSubscriptionItemQuantity(subscriptionId: string, quantity: number) {
  if (isTest) return true;
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = sub.items.data[0]?.id;
  if (!itemId) return false;
  await stripe.subscriptionItems.update(itemId, { quantity, proration_behavior: 'always_invoice' });
  return true;
}
