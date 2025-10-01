import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { prisma } from '../db.js';
import { zParse } from '../errors.js';
import { HolidayBody } from '../schemas/time-leave.js';
import { registry } from '../openapi.js';
import { z } from 'zod';

const router = Router();

registry.registerPath({ method:'get', path:'/v1/holidays', tags:['holidays'], responses:{200:{description:'OK'}} });
router.get('/', tenantResolver, requireAuth, async (req, res) => {
  const { tenantId } = req.tenant!;
  const items = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.holidayCalendar.findMany({ orderBy:{ date:'asc' } });
  });
  res.json(items);
});

registry.registerPath({
  method:'post', path:'/v1/holidays', tags:['holidays'],
  request:{ body:{ content:{ 'application/json':{ schema: HolidayBody } } } },
  responses:{201:{description:'Created'}}
});
router.post('/', tenantResolver, requireAuth, rbacGuard(Action.HOLIDAY_MANAGE), async (req, res) => {
  const body = zParse(HolidayBody)(req.body);
  const { tenantId } = req.tenant!;
  const row = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.holidayCalendar.create({ data: { tenantId, date: new Date(body.date), name: body.name } });
  });
  res.status(201).json(row);
});

registry.registerPath({
  method:'delete', path:'/v1/holidays/{id}', tags:['holidays'],
  request:{ params: z.object({ id: z.string().uuid() }) },
  responses:{204:{description:'Deleted'}}
});
router.delete('/:id', tenantResolver, requireAuth, rbacGuard(Action.HOLIDAY_MANAGE), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!;
  await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    await tx.holidayCalendar.delete({ where: { id } });
  });
  res.status(204).send();
});

export default router;
