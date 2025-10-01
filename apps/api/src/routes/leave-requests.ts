import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { prisma } from '../db.js';
import { zParse, HttpError } from '../errors.js';
import { LeaveRequestCreate, LeaveQuery } from '../schemas/time-leave.js';
import { registry } from '../openapi.js';
import { z } from 'zod';

const router = Router();

registry.registerPath({ method:'get', path:'/v1/leave/requests', tags:['leave'], responses:{200:{description:'OK'}} });
router.get('/requests', tenantResolver, requireAuth, rbacGuard(Action.LEAVE_REQUEST_READ), async (req, res) => {
  const q = zParse(LeaveQuery)(req.query);
  const { tenantId } = req.tenant!;
  const userId = req.user!.userId;

  const filterUserId = ((): string | undefined => {
    // OWN scope enforced by guard; to keep simple, if EMPLOYEE we default to own.
    if (req.user!.role === 'EMPLOYEE') return userId;
    return q.userId ?? undefined;
  })();

  const items = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.leaveRequest.findMany({
      where: {
        ...(filterUserId ? { userId: filterUserId } : {}),
        ...(q.status ? { status: q.status as any } : {}),
        ...(q.from ? { startDate: { gte: new Date(q.from) } } : {}),
        ...(q.to ? { endDate: { lte: new Date(q.to) } } : {}),
      },
      include: { type: true, user: true },
      orderBy: { startDate: 'desc' }
    });
  });

  res.json(items);
});

registry.registerPath({
  method:'post', path:'/v1/leave/requests', tags:['leave'],
  request:{ body:{ content:{ 'application/json':{ schema: LeaveRequestCreate } } } },
  responses:{201:{description:'Created'}}
});
router.post('/requests', tenantResolver, requireAuth, rbacGuard(Action.LEAVE_REQUEST_CREATE, (req)=>({targetUserId:req.user!.userId})), async (req, res) => {
  const body = zParse(LeaveRequestCreate)(req.body);
  const { tenantId } = req.tenant!;
  const userId = req.user!.userId;

  const created = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);

    const type = await tx.leaveType.findUnique({ where: { id: body.typeId } });
    if (!type) throw new HttpError(400, 'INVALID_TYPE', 'Leave type not found');

    const s = new Date(body.startDate);
    const e = new Date(body.endDate);
    if (e < s) throw new HttpError(400, 'INVALID_RANGE', 'endDate before startDate');

    // No holidays if not allowed
    if (!type.allowOnHolidays) {
      const h = await tx.holidayCalendar.findFirst({ where: { date: { gte: s, lte: e } } });
      if (h) throw new HttpError(400, 'HOLIDAY_BLOCKED', `Falls on holiday: ${h.name}`);
    }

    // Prevent overlap with APPROVED
    const overlap = await tx.$queryRawUnsafe<Array<{ id:string }>>(
      `SELECT id FROM "LeaveRequest"
       WHERE "tenantId" = $1 AND "userId" = $2 AND status = 'APPROVED'
         AND NOT ($3::timestamp > "endDate" OR $4::timestamp < "startDate")
       LIMIT 1`,
       tenantId, userId, s, e
    );
    if (overlap.length > 0) throw new HttpError(409, 'OVERLAP', 'Overlaps with existing approved leave');

    const row = await tx.leaveRequest.create({
      data: {
        tenantId, userId, typeId: body.typeId, startDate: s, endDate: e,
        hours: body.hours, status: type.requiresApproval ? 'PENDING' : 'APPROVED'
      }
    });
    return row;
  });

  res.status(201).json(created);
});

async function approveOrReject(id: string, approve: boolean, tenantId: string, approverId: string) {
  return prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    const row = await tx.leaveRequest.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, 'NOT_FOUND', 'Request not found');
    if (row.status !== 'PENDING') throw new HttpError(409, 'INVALID_STATE', 'Must be PENDING');

    return tx.leaveRequest.update({
      where: { id },
      data: { status: approve ? 'APPROVED' : 'REJECTED', approverId, decidedAt: new Date() }
    });
  });
}

registry.registerPath({ method:'post', path:'/v1/leave/requests/{id}/approve', tags:['leave'], request: {params: z.object({id: z.string().uuid()})}, responses:{200:{description:'OK'}} });
router.post('/requests/:id/approve', tenantResolver, requireAuth, rbacGuard(Action.LEAVE_APPROVE), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!; const approverId = req.user!.userId;
  const row = await approveOrReject(id, true, tenantId, approverId);
  res.json(row);
});

registry.registerPath({ method:'post', path:'/v1/leave/requests/{id}/reject', tags:['leave'], request: {params: z.object({id: z.string().uuid()})}, responses:{200:{description:'OK'}} });
router.post('/requests/:id/reject', tenantResolver, requireAuth, rbacGuard(Action.LEAVE_APPROVE), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!; const approverId = req.user!.userId;
  const row = await approveOrReject(id, false, tenantId, approverId);
  res.json(row);
});

registry.registerPath({ method:'post', path:'/v1/leave/requests/{id}/cancel', tags:['leave'], request: {params: z.object({id: z.string().uuid()})}, responses:{200:{description:'OK'}} });
router.post('/requests/:id/cancel', tenantResolver, requireAuth, rbacGuard(Action.LEAVE_REQUEST_CANCEL, (req)=>({targetUserId:req.user!.userId})), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!; const userId = req.user!.userId;

  const row = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    const cur = await tx.leaveRequest.findUnique({ where: { id } });
    if (!cur || cur.userId !== userId) throw new HttpError(404, 'NOT_FOUND', 'Request not found');
    if (cur.status !== 'PENDING') throw new HttpError(409, 'INVALID_STATE', 'Only PENDING can be canceled');
    return tx.leaveRequest.update({ where: { id }, data: { status: 'CANCELED' } });
  });

  res.json(row);
});

export default router;
