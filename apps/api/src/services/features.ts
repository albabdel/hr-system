import { prisma } from '../db.js';

export type Feature =
  | 'recruiting'
  | 'payroll'
  | 'lms'
  | 'analytics'
  | 'advanced_exports';

const PLAN_FEATURES: Record<'BASIC'|'PRO'|'ENTERPRISE', Feature[]> = {
  BASIC: ['recruiting'],
  PRO: ['recruiting','lms','analytics'],
  ENTERPRISE: ['recruiting','lms','analytics','payroll','advanced_exports']
};

export async function tenantHasFeature(tenantId: string, feature: Feature) {
  const sub = await prisma.billingSubscription.findUnique({ where: { tenantId } });
  if (!sub || sub.status !== 'ACTIVE') return false;
  const plan = sub.plan as 'BASIC'|'PRO'|'ENTERPRISE';
  return PLAN_FEATURES[plan].includes(feature);
}
