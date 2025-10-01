import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { prisma } from '../db.js';
import { zParse, HttpError } from '../errors.js';
import { TimeClockRange } from '../schemas/time-leave.js';
import { registry } from '../openapi.js';
import { z } from 'zod';

const router = Router();

registry.registerPath({
  method: 'post', path: '/v1/time/clock/in', tags: ['time'],
  responses: { 200: { description: 'OK' } }
});
router.post('/in', tenantResolver, requireAuth, rbacGuard(Action.TIME_CLOCK, (req)=>({targetUserId:req.user!.userId})), async (req, res) => {
  const { tenantId } = req.tenant!;
  const userId = req.user!.userId;

  const row = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    const open = await tx.timeClock.findFirst({ where: { userId, clockOut: null } });
    if (open) throw new HttpError(409, 'ALREADY_CLOCKED_IN', 'Open shift exists');

    return tx.timeClock.create({ data: { tenantId, userId, clockIn: new Date() } });
  });

  res.json({ id: row.id, clockIn: row.clockIn });
});

registry.registerPath({
  method: 'post', path: '/v1/time/clock/out', tags: ['time'],
  responses: { 200: { description: 'OK' } }
});
router.post('/out', tenantResolver, requireAuth, rbacGuard(Action.TIME_CLOCK, (req)=>({targetUserId:req.user!.userId})), async (req, res) => {
  const { tenantId } = req.tenant!;
  const userId = req.user!.userId;

  const row = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    const open = await tx.timeClock.findFirst({ where: { userId, clockOut: null } });
    if (!open) throw new HttpError(409, 'NOT_CLOCKED_IN', 'No open shift');

    const now = new Date();
    const minutes = Math.max(0, Math.round((now.getTime() - open.clockIn.getTime()) / 60000));
    return tx.timeClock.update({ where: { id: open.id }, data: { clockOut: now, durationM: minutes } });
  });

  res.json({ id: row.id, clockOut: row.clockOut, durationM: row.durationM });
});

registry.registerPath({
  method: 'get', path: '/v1/time/clock/me', tags: ['time'],
  request: { query: TimeClockRange },
  responses: { 200: { description: 'OK' } }
});
router.get('/me', tenantResolver, requireAuth, rbacGuard(Action.TIME_CLOCK, (req)=>({targetUserId:req.user!.userId})), async (req, res) => {
  const { tenantId } = req.tenant!;
  const userId = req.user!.userId;
  const q = zParse(TimeClockRange)(req.query);
  const from = q.from ? new Date(q.from) : new Date(Date.now() - 14*24*3600*1000);
  const to   = q.to ? new Date(q.to) : new Date();

  const items = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.timeClock.findMany({
      where: { userId, clockIn: { gte: from }, clockOut: { lte: to } },
      orderBy: { clockIn: 'desc' }
    });
  });

  res.json({ items });
});

export default router;
