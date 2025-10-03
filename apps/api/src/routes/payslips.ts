import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse, HttpError } from '../errors.js';
import { prisma } from '../db.js';
import { registry } from '../openapi.js';
import { z } from 'zod';
import { presignGet } from '../storage/s3.js';

const router = Router();
const Params = z.object({ id: z.string().uuid() });

registry.registerPath({
  method: 'get', path: '/v1/payslips/{id}/pdf-url', tags: ['payroll'],
  request: { params: Params }, responses: { 200: { description: 'OK' }, 404: { description: 'Not Found' } }
});

router.get('/:id/pdf-url', tenantResolver, requireAuth, rbacGuard(Action.PAYROLL_RUN), async (req, res) => {
  const { id } = zParse(Params)(req.params);
  const { tenantId } = req.tenant!;
  const slip = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.payslip.findUnique({ where: { id }, include: { pdfFile: true } });
  });
  if (!slip) throw new HttpError(404, 'NOT_FOUND', 'Payslip not found');
  if (!slip.pdfFile) throw new HttpError(404, 'PDF_NOT_READY', 'Payslip PDF not generated');
  const url = await presignGet(slip.pdfFile.objectKey);
  res.json({ url, contentType: slip.pdfFile.contentType });
});

export default router;
