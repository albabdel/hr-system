import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse, HttpError } from '../errors.js';
import { RunCreate, RunId } from '../schemas/payroll.js';
import { prisma } from '../db.js';
import { registry } from '../openapi.js';
import { calculatePayslipsForRun } from '../services/payroll.js';
import { enqueuePayrollCalc } from '../worker/producer.js';

const router = Router();

registry.registerPath({
  method: 'post', path: '/v1/payroll/runs', tags: ['payroll'],
  request: { body: { content: { 'application/json': { schema: RunCreate } } } },
  responses: { 201: { description: 'Created' } }
});
router.post('/runs', tenantResolver, requireAuth, rbacGuard(Action.PAYROLL_RUN), async (req, res) => {
  const body = zParse(RunCreate)(req.body);
  const { tenantId } = req.tenant!;
  const s = new Date(body.periodStart), e = new Date(body.periodEnd);
  if (e < s) throw new HttpError(400, 'INVALID_RANGE', 'periodEnd < periodStart');

  const run = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.payrollRun.create({
      data: { tenantId, calendarId: body.calendarId, periodStart: s, periodEnd: e }
    });
  });

  res.status(201).json(run);
});

registry.registerPath({
  method: 'post', path: '/v1/payroll/runs/{id}/calc', tags: ['payroll'],
  request: { params: RunId }, responses: { 200: { description: 'OK' } }
});
router.post('/runs/:id/calc', tenantResolver, requireAuth, rbacGuard(Action.PAYROLL_RUN), async (req, res) => {
  const { id } = zParse(RunId)(req.params);
  const { tenantId } = req.tenant!;
  if (process.env.NODE_ENV === 'test') {
    await calculatePayslipsForRun(tenantId, id);
  } else {
    await enqueuePayrollCalc({ tenantId, runId: id });
  }
  res.json({ ok: true });
});

async function transition(runId: string, to: 'REVIEW'|'APPROVED'|'FINALIZED', tenantId: string) {
  return prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    const run = await tx.payrollRun.findUnique({ where: { id: runId }, include: { payslips: true } });
    if (!run) throw new HttpError(404, 'NOT_FOUND', 'Run not found');

    const valid: Record<string,string[]> = {
      DRAFT: ['REVIEW'],
      REVIEW: ['APPROVED'],
      APPROVED: ['FINALIZED'],
      FINALIZED: []
    };
    if (!valid[run.status].includes(to)) {
      throw new HttpError(409, 'INVALID_STATE', `Cannot transition from ${run.status} to ${to}`);
    }

    // basic guards
    if (to !== 'REVIEW' && run.payslips.length === 0) {
      throw new HttpError(409, 'NO_PAYSLIPS', 'Calculate payslips first');
    }

    return tx.payrollRun.update({ where: { id: run.id }, data: { status: to as any } });
  });
}

for (const step of ['submit','approve','finalize'] as const) {
  const to = step === 'submit' ? 'REVIEW' : step === 'approve' ? 'APPROVED' : 'FINALIZED';
  registry.registerPath({
    method: 'post', path: `/v1/payroll/runs/{id}/${step}`, tags: ['payroll'],
    request: { params: RunId }, responses: { 200: { description: 'OK' } }
  });
  router.post(`/runs/:id/${step}`, tenantResolver, requireAuth, rbacGuard(Action.PAYROLL_RUN), async (req, res) => {
    const { id } = zParse(RunId)(req.params);
    const { tenantId } = req.tenant!;
    const row = await transition(id, to as any, tenantId);
    res.json(row);
  });
}

registry.registerPath({
  method: 'get', path: '/v1/payroll/runs/{id}', tags: ['payroll'],
  request: { params: RunId }, responses: { 200: { description: 'OK' } }
});
router.get('/runs/:id', tenantResolver, requireAuth, rbacGuard(Action.PAYROLL_RUN), async (req, res) => {
  const { id } = zParse(RunId)(req.params);
  const { tenantId } = req.tenant!;
  const row = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.payrollRun.findUnique({ where: { id }, include: { payslips: true, calendar: true } });
  });
  res.json(row);
});

export default router;
