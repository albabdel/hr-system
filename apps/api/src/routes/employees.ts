import { Router } from 'express';
import { zParse, HttpError } from '../errors.js';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { prisma } from '../db.js';
import { auditLog } from '../audit.js';
import { EmployeeCreate, EmployeeUpdate, EmployeeListQuery, EmployeeResponse } from '../schemas/employee.js';
import { registry } from '../openapi.js';
import { z } from 'zod';
import { writesLimiter } from '../rate-limit.js';

const router = Router();

// OpenAPI registration
registry.registerPath({
  method: 'get',
  path: '/v1/employees',
  tags: ['employees'],
  request: { query: EmployeeListQuery },
  responses: {
    200: {
      description: 'List employees',
      content: { 'application/json': { schema: z.object({
        items: z.array(EmployeeResponse),
        nextCursor: z.string().uuid().nullable(),
        total: z.number().int().nonnegative(),
      }) } },
    },
  },
});

router.get(
  '/',
  tenantResolver,
  requireAuth,
  rbacGuard(Action.EMPLOYEE_READ),
  async (req, res) => {
    const q = zParse(EmployeeListQuery)(req.query);
    const { tenantId } = req.tenant!;

    const data = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);

      const where: any = {};
      if (q.departmentId) where.departmentId = q.departmentId;
      if (q.status) where.status = q.status;
      if (q.search) {
        where.OR = [
          { firstName: { contains: q.search, mode: 'insensitive' } },
          { lastName: { contains: q.search, mode: 'insensitive' } },
          { email: { contains: q.search, mode: 'insensitive' } },
        ];
      }

      const items = await tx.employee.findMany({
        where,
        orderBy: { id: 'asc' },
        take: q.limit + 1,
        ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
      });

      const next = items.length > q.limit ? items.pop()! : null;
      const total = await tx.employee.count({ where });

      return { items, nextCursor: next?.id ?? null, total };
    });

    res.json(data);
  }
);

// Create
registry.registerPath({
  method: 'post',
  path: '/v1/employees',
  tags: ['employees'],
  request: { body: { content: { 'application/json': { schema: EmployeeCreate } } } },
  responses: { 201: { description: 'Created', content: { 'application/json': { schema: EmployeeResponse } } } },
});

router.post(
  '/',
  writesLimiter,
  tenantResolver,
  requireAuth,
  rbacGuard(Action.EMPLOYEE_CREATE),
  async (req, res) => {
    const body = zParse(EmployeeCreate)(req.body);
    const { tenantId } = req.tenant!;
    const actor = req.user?.userId;

    const created = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
      const exists = await tx.employee.findUnique({ where: { tenantId_email: { tenantId, email: body.email } } });
      if (exists) throw new HttpError(409, 'EMPLOYEE_EXISTS', 'Email already used');

      const row = await tx.employee.create({ data: { tenantId, ...body, departmentId: body.departmentId ?? null, hiredAt: body.hiredAt ? new Date(body.hiredAt) : null } });
      await auditLog({
        tenantId,
        actorUserId: actor,
        entity: 'Employee',
        entityId: row.id,
        action: 'CREATE',
        after: row,
        ip: req.ip, ua: req.headers['user-agent'] as string | undefined
      });
      return row;
    });

    res.status(201).json(created);
  }
);

// Read by id
registry.registerPath({
  method: 'get',
  path: '/v1/employees/{id}',
  tags: ['employees'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: EmployeeResponse } } }, 404: { description: 'Not found' } },
});

router.get(
  '/:id',
  tenantResolver,
  requireAuth,
  rbacGuard(Action.EMPLOYEE_READ),
  async (req, res) => {
    const { tenantId } = req.tenant!;
    const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);

    const row = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
      return tx.employee.findUnique({ where: { id } });
    });

    if (!row) throw new HttpError(404, 'NOT_FOUND', 'Employee not found');
    res.json(row);
  }
);

// Update
registry.registerPath({
  method: 'patch',
  path: '/v1/employees/{id}',
  tags: ['employees'],
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { 'application/json': { schema: EmployeeUpdate } } },
  },
  responses: { 200: { description: 'OK', content: { 'application/json': { schema: EmployeeResponse } } } },
});

router.patch(
  '/:id',
  writesLimiter,
  tenantResolver,
  requireAuth,
  rbacGuard(Action.EMPLOYEE_UPDATE),
  async (req, res) => {
    const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
    const patch = zParse(EmployeeUpdate)(req.body);
    const { tenantId } = req.tenant!;
    const actor = req.user?.userId;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
      const before = await tx.employee.findUnique({ where: { id } });
      if (!before) throw new HttpError(404, 'NOT_FOUND', 'Employee not found');

      const row = await tx.employee.update({
        where: { id },
        data: {
          ...patch,
          departmentId: patch.departmentId === undefined ? before.departmentId : (patch.departmentId ?? null),
          hiredAt: patch.hiredAt === undefined ? before.hiredAt : (patch.hiredAt ? new Date(patch.hiredAt) : null),
        },
      });

      await auditLog({
        tenantId,
        actorUserId: actor,
        entity: 'Employee',
        entityId: row.id,
        action: 'UPDATE',
        before: before,
        after: row,
        ip: req.ip, ua: req.headers['user-agent'] as string | undefined
      });

      return row;
    });

    res.json(updated);
  }
);

// Delete
registry.registerPath({
  method: 'delete',
  path: '/v1/employees/{id}',
  tags: ['employees'],
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 204: { description: 'Deleted' } },
});

router.delete(
  '/:id',
  writesLimiter,
  tenantResolver,
  requireAuth,
  rbacGuard(Action.EMPLOYEE_DELETE),
  async (req, res) => {
    const { id } = zParse(z.object({ id: z.string().uuid() }))(req.params);
    const { tenantId } = req.tenant!;
    const actor = req.user?.userId;

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
      const before = await tx.employee.findUnique({ where: { id } });
      if (!before) throw new HttpError(404, 'NOT_FOUND', 'Employee not found');
      await tx.employee.delete({ where: { id } });
      await auditLog({
        tenantId,
        actorUserId: actor,
        entity: 'Employee',
        entityId: id,
        action: 'DELETE',
        before,
        ip: req.ip, ua: req.headers['user-agent'] as string | undefined
      });
    });

    res.status(204).send();
  }
);

export default router;
