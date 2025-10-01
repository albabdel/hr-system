import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { prisma } from '../db.js';
import { zParse } from '../errors.js';
import { LeaveTypeBody, LeaveTypeUpdate } from '../schemas/time-leave.js';
import { registry } from '../openapi.js';
import { z } from 'zod';

const router = Router();

registry.registerPath({ method:'get', path:'/v1/leave/types', tags:['leave'], responses:{200:{description:'OK'}} });
router.get('/types', tenantResolver, requireAuth, async (req, res) => {
  const { tenantId } = req.tenant!;
  const items = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.leaveType.findMany({ orderBy:{ name:'asc' } });
  });
  res.json(items);
});

registry.registerPath({
  method:'post', path:'/v1/leave/types', tags:['leave'],
  request:{ body:{ content:{ 'application/json':{ schema: LeaveTypeBody } } } },
  responses:{201:{description:'Created'}}
});
router.post('/types', tenantResolver, requireAuth, rbacGuard(Action.LEAVE_TYPE_MANAGE), async (req, res) => {
  const body = zParse(LeaveTypeBody)(req.body);
  const { tenantId } = req.tenant!;
  const row = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.leaveType.create({ data:{ tenantId, ...body } });
  });
  res.status(201).json(row);
});

registry.registerPath({
  method:'patch', path:'/v1/leave/types/{id}', tags:['leave'],
  request:{ params: z.object({ id: z.string().uuid() }), body:{ content:{ 'application/json':{ schema: LeaveTypeUpdate } } } },
  responses:{200:{description:'OK'}}
});
router.patch('/types/:id', tenantResolver, requireAuth, rbacGuard(Action.LEAVE_TYPE_MANAGE), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const patch = zParse(LeaveTypeUpdate)(req.body);
  const { tenantId } = req.tenant!;
  const row = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.leaveType.update({ where:{ id }, data: patch });
  });
  res.json(row);
});

registry.registerPath({
  method:'delete', path:'/v1/leave/types/{id}', tags:['leave'],
  request:{ params: z.object({ id: z.string().uuid() }) },
  responses:{204:{description:'Deleted'}}
});
router.delete('/types/:id', tenantResolver, requireAuth, rbacGuard(Action.LEAVE_TYPE_MANAGE), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!;
  await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    await tx.leaveType.delete({ where:{ id } });
  });
  res.status(204).send();
});

export default router;
