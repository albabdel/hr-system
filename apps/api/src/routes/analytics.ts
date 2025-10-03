import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse } from '../errors.js';
import { RangeQuery, ExportCreate, ExportId } from '../schemas/analytics.js';
import { headcountSeries, payrollCostSeries } from '../services/analytics.js';
import { prisma } from '../db.js';
import { registry } from '../openapi.js';

const router = Router();

registry.registerPath({
  method: 'get', path: '/v1/analytics/headcount', tags: ['analytics'],
  request: { query: RangeQuery }, responses: { 200: { description: 'OK' } }
});
router.get('/headcount', tenantResolver, requireAuth, rbacGuard(Action.EMPLOYEE_READ), async (req, res) => {
  const { tenantId } = req.tenant!;
  const q = zParse(RangeQuery)(req.query);
  const data = await headcountSeries(
    tenantId,
    q.from ? new Date(q.from) : undefined,
    q.to ? new Date(q.to) : undefined,
    q.groupBy ?? 'day'
  );
  res.json({ series: data });
});

registry.registerPath({
  method: 'get', path: '/v1/analytics/payroll-cost', tags: ['analytics'],
  request: { query: RangeQuery }, responses: { 200: { description: 'OK' } }
});
router.get('/payroll-cost', tenantResolver, requireAuth, rbacGuard(Action.PAYROLL_RUN), async (req, res) => {
  const { tenantId } = req.tenant!;
  const q = zParse(RangeQuery)(req.query);
  const data = await payrollCostSeries(
    tenantId, q.from ? new Date(q.from) : undefined, q.to ? new Date(q.to) : undefined
  );
  res.json({ series: data });
});

registry.registerPath({
  method: 'post', path: '/v1/analytics/exports', tags: ['analytics'],
  request: { body: { content: { 'application/json': { schema: ExportCreate } } } },
  responses: { 200: { description: 'OK' } }
});
router.post('/exports', tenantResolver, requireAuth, async (req, res) => {
  const { tenantId } = req.tenant!;
  const body = zParse(ExportCreate)(req.body);
  const job = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.exportJob.create({ data: { tenantId, type: body.type, params: body } });
  });
  const { enqueueAnalyticsExport } = await import('../worker/producer.js');
  await enqueueAnalyticsExport({ tenantId, jobId: job.id });
  res.json({ jobId: job.id, status: job.status });
});

registry.registerPath({
  method: 'get', path: '/v1/analytics/exports/{id}', tags: ['analytics'],
  request: { params: ExportId }, responses: { 200: { description: 'OK' } }
});
router.get('/exports/:id', tenantResolver, requireAuth, async (req, res) => {
  const { tenantId } = req.tenant!;
  const { id } = zParse(ExportId)(req.params);
  const row = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.exportJob.findUnique({ where: { id } });
  });
  if (!row) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ status: row.status, fileId: row.fileId ?? null, error: row.error ?? null });
});

registry.registerPath({
  method: 'post', path: '/v1/analytics/refresh', tags: ['analytics'],
  responses: { 200: { description: 'OK' } }
});
router.post('/refresh', tenantResolver, requireAuth, rbacGuard(Action.EMPLOYEE_READ), async (req, res) => {
  const { tenantId } = req.tenant!;
  const { enqueueAnalyticsRefresh } = await import('../worker/producer.js');
  await enqueueAnalyticsRefresh({ tenantId });
  res.json({ ok: true });
});

export default router;
