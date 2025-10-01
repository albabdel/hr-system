import { prisma } from './db.js';

export async function auditLog(params: {
  tenantId: string;
  actorUserId?: string;
  entity: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  ua?: string | null;
}) {
  const { tenantId, actorUserId, entity, entityId, action, before, after, ip, ua } = params;
  await prisma.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
  await prisma.auditLog.create({
    data: {
      tenantId,
      actorUserId,
      entity,
      entityId,
      action,
      before: before ? (before as any) : undefined,
      after: after ? (after as any) : undefined,
      ip: ip ?? undefined,
      userAgent: ua ?? undefined,
    },
  });
}
