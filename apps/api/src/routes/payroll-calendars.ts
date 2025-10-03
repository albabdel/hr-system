import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse } from '../errors.js';
import { CalendarCreate } from '../schemas/payroll.js';
import { prisma } from '../db.js';
import { registry } from '../openapi.js';

const router = Router();

registry.registerPath({
  method: 'post', path: '/v1/payroll/calendars', tags: ['payroll'],
  request: { body: { content: { 'application/json': { schema: CalendarCreate } } } },
  responses: { 201: { description: 'Created' } }
});
router.post('/calendars', tenantResolver, requireAuth, rbacGuard(Action.PAYROLL_RUN), async (req, res) => {
  const body = zParse(CalendarCreate)(req.body);
  const { tenantId } = req.tenant!;

  const row = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.payrollCalendar.create({ data: { tenantId, ...body } });
  });

  res.status(201).json(row);
});

registry.registerPath({
  method: 'get', path: '/v1/payroll/calendars', tags: ['payroll'],
  responses: { 200: { description: 'OK' } }
});
router.get('/calendars', tenantResolver, requireAuth, rbacGuard(Action.PAYROLL_RUN), async (req, res) => {
  const { tenantId } = req.tenant!;
  const items = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.payrollCalendar.findMany({ orderBy: { createdAt: 'desc' } });
  });
  res.json(items);
});

export default router;
