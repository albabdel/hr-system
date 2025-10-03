import { z } from 'zod';
import { registry } from '../openapi.js';

export const Plan = z.enum(['BASIC','PRO','ENTERPRISE']);

export const CheckoutCreate = z.object({
  plan: Plan,
  seats: z.number().int().min(1).max(1000).default(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
});

export const PortalCreate = z.object({
  returnUrl: z.string().url().optional()
});

registry.register('BillingCheckoutCreate', CheckoutCreate);
registry.register('BillingPortalCreate', PortalCreate);
