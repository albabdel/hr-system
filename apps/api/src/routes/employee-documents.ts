import { Router } from 'express';
import { z } from 'zod';
import { registry } from '../openapi.js';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse, HttpError } from '../errors.js';
import { prisma } from '../db.js';
import { auditLog } from '../audit.js';

const router = Router();

const AttachBody = z.object({
  fileId: z.string().uuid(),
  title: z.string().max(200).optional(),
});
registry.registerPath({
  method: 'post',
  path: '/v1/employees/{id}/documents',
  tags: ['employees','files'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: AttachBody } } }
  },
  responses: { 201: { description: 'Created' } },
});

router.post('/:id/documents', tenantResolver, requireAuth, rbacGuard(Action.EMPLOYEE_UPDATE), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { fileId, title } = zParse(AttachBody)(req.body);
  const { tenantId } = req.tenant!;
  const actor = req.user!.userId;

  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    const employee = await tx.employee.findUnique({ where: { id } });
    if (!employee) throw new HttpError(404, 'NOT_FOUND', 'Employee not found');

    const file = await tx.fileObject.findUnique({ where: { id: fileId } });
    if (!file) throw new HttpError(404, 'NOT_FOUND', 'File not found');

    const link = await tx.employeeDocument.create({
      data: { tenantId, employeeId: id, fileId, title },
    });

    await auditLog({
      tenantId,
      actorUserId: actor,
      entity: 'EmployeeDocument',
      entityId: link.id,
      action: 'ATTACH',
      after: { employeeId: id, fileId, title },
      ip: req.ip, ua: req.headers['user-agent'] as string | undefined
    });

    return { link, file };
  });

  res.status(201).json({ id: result.link.id, fileId: result.link.fileId, title: result.link.title });
});

registry.registerPath({
  method: 'get',
  path: '/v1/employees/{id}/documents',
  tags: ['employees','files'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: 'OK' } },
});

router.get('/:id/documents', tenantResolver, requireAuth, rbacGuard(Action.EMPLOYEE_READ), async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!;

  const items = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return tx.employeeDocument.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' },
      include: { file: true },
    });
  });

  res.json(items.map((d) => ({
    id: d.id,
    title: d.title,
    createdAt: d.createdAt,
    file: {
      id: d.file.id, contentType: d.file.contentType,
      objectKey: d.file.objectKey, sizeBytes: d.file.sizeBytes,
      metadata: d.file.metadata,
    }
  })));
});

export default router;
