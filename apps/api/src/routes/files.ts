import { Router } from 'express';
import { z } from 'zod';
import { registry } from '../openapi.js';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse, HttpError } from '../errors.js';
import { prisma } from '../db.js';
import { presignPut, presignGet } from '../storage/s3.js';
import { auditLog } from '../audit.js';
import crypto from 'crypto';

const router = Router();

const SignUploadBody = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(3),
  sizeBytes: z.number().int().positive(),
});
registry.registerPath({
  method: 'post',
  path: '/v1/files/sign-upload',
  tags: ['files'],
  request: { body: { content: { 'application/json': { schema: SignUploadBody } } } },
  responses: { 200: { description: 'OK' } },
});

router.post('/sign-upload', tenantResolver, requireAuth, rbacGuard(Action.EMPLOYEE_UPDATE), async (req, res) => {
  const { filename, contentType, sizeBytes } = zParse(SignUploadBody)(req.body);
  const { tenantId } = req.tenant!;
  const actor = req.user!.userId;

  const ext = filename.includes('.') ? filename.split('.').pop()! : 'bin';
  const objectKey = `${tenantId}/${crypto.randomUUID()}.${ext}`;

  const url = await presignPut(objectKey, contentType);

  const file = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    const row = await tx.fileObject.create({
      data: {
        tenantId,
        bucket: process.env.STORAGE_BUCKET!,
        objectKey,
        sizeBytes,
        contentType,
        createdByUserId: actor,
        metadata: { filename, virusScan: 'pending' },
      },
    });
    await auditLog({
      tenantId,
      actorUserId: actor,
      entity: 'FileObject',
      entityId: row.id,
      action: 'CREATE',
      after: row,
      ip: req.ip, ua: req.headers['user-agent'] as string | undefined
    });
    return row;
  });

  // enqueue scan job
  await import('../worker/producer.js').then((m) => m.enqueueFileScan({ tenantId, fileId: file.id, objectKey }));

  res.json({ uploadUrl: url, fileId: file.id, objectKey });
});

registry.registerPath({
  method: 'get',
  path: '/v1/files/{id}/signed-url',
  tags: ['files'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: 'OK' } },
});
router.get('/:id/signed-url', tenantResolver, requireAuth, async (req, res) => {
  const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
  const { tenantId } = req.tenant!;

  const row = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return tx.fileObject.findUnique({ where: { id } });
  });
  if (!row) throw new HttpError(404, 'NOT_FOUND', 'File not found');

  const url = await presignGet(row.objectKey);
  res.json({ url, contentType: row.contentType, filename: (row.metadata as any)?.filename ?? null });
});

export default router;
