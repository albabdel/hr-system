import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { HttpError, zParse } from '../errors.js';
import { registry } from '../openapi.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { tenantResolver } from '../middleware/tenant.js';
import crypto from 'crypto';

const router = Router();

const RegisterTenantBody = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]{2,}$/),
  owner: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(8),
  }),
});
registry.registerPath({
  method: 'post',
  path: '/auth/register-tenant',
  tags: ['auth'],
  request: { body: { content: { 'application/json': { schema: RegisterTenantBody } } } },
  responses: { 200: { description: 'OK' } },
});

router.post('/register-tenant', async (req, res) => {
  const body = zParse(RegisterTenantBody)(req.body);

  const exists = await prisma.tenant.findUnique({ where: { slug: body.slug } });
  if (exists) throw new HttpError(409, 'TENANT_EXISTS', 'Slug already in use');

  const { tenant, owner } = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({ data: { name: body.name, slug: body.slug } });
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenant.id);
    const passwordHash = await hashPassword(body.owner.password);
    const owner = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: body.owner.email.toLowerCase(),
        name: body.owner.name,
        role: 'OWNER',
        passwordHash,
      },
    });
    return { tenant, owner };
  });

  const access = signAccessToken({ sub: owner.id, tid: tenant.id, role: owner.role });
  const refresh = signRefreshToken({ sub: owner.id, tid: tenant.id, jti: crypto.randomUUID() });

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenant.id);
    await tx.refreshToken.create({
      data: {
        tenantId: tenant.id,
        userId: owner.id,
        token: refresh,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });
  });

  return res.json({ tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name }, accessToken: access, refreshToken: refresh });
});

const LoginBody = z.object({ email: z.string().email(), password: z.string().min(1) });
registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['auth'],
  request: { body: { content: { 'application/json': { schema: LoginBody } } } },
  responses: { 200: { description: 'OK' } },
});
router.post('/login', tenantResolver, async (req, res) => {
  const body = zParse(LoginBody)(req.body);
  const { tenantId } = req.tenant!;

  const user = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return tx.user.findUnique({ where: { tenantId_email: { tenantId, email: body.email.toLowerCase() } } });
  });

  if (!user) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    await tx.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  });

  const access = signAccessToken({ sub: user.id, tid: tenantId, role: user.role });
  const refresh = signRefreshToken({ sub: user.id, tid: tenantId, jti: crypto.randomUUID() });

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    await tx.refreshToken.create({
      data: {
        tenantId,
        userId: user.id,
        token: refresh,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });
  });

  return res.json({ accessToken: access, refreshToken: refresh, user: { id: user.id, role: user.role, email: user.email, name: user.name } });
});

const RefreshBody = z.object({ refreshToken: z.string().min(10) });
registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  tags: ['auth'],
  request: { body: { content: { 'application/json': { schema: RefreshBody } } } },
  responses: { 200: { description: 'OK' } },
});
router.post('/refresh', tenantResolver, async (req, res) => {
  const { refreshToken } = zParse(RefreshBody)(req.body);
  const { tenantId } = req.tenant!;

  const claims = (() => {
    try {
      return verifyToken<{ typ: string; sub: string; tid: string }>(refreshToken);
    } catch {
      throw new HttpError(401, 'UNAUTHORIZED', 'Invalid refresh token');
    }
  })();
  if (claims.typ !== 'refresh' || claims.tid !== tenantId) throw new HttpError(401, 'UNAUTHORIZED', 'Invalid refresh token');

  const tokenRow = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    return tx.refreshToken.findUnique({ where: { token: refreshToken } });
  });
  if (!tokenRow || tokenRow.revoked) throw new HttpError(401, 'UNAUTHORIZED', 'Refresh token revoked');

  // rotate
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    await tx.refreshToken.update({ where: { id: tokenRow.id }, data: { revoked: true } });
  });

  const user = await prisma.user.findUnique({ where: { id: tokenRow.userId }});
  if (!user) throw new HttpError(401, 'UNAUTHORIZED', 'User not found');

  const access = signAccessToken({ sub: tokenRow.userId, tid: tenantId, role: user.role });
  const nextRefresh = signRefreshToken({ sub: tokenRow.userId, tid: tenantId, jti: crypto.randomUUID() });

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    await tx.refreshToken.create({
      data: {
        tenantId,
        userId: tokenRow.userId,
        token: nextRefresh,
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });
  });

  return res.json({ accessToken: access, refreshToken: nextRefresh });
});

const InviteBody = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['HR_ADMIN', 'MANAGER', 'EMPLOYEE']),
});
registry.registerPath({
  method: 'post',
  path: '/auth/invite',
  tags: ['auth'],
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: InviteBody } } } },
  responses: { 200: { description: 'OK' } },
});
registry.registerComponent("securitySchemes", "bearerAuth", { type: "http", scheme: "bearer" });

router.post('/invite', tenantResolver, requireAuth, requireRoles('OWNER', 'HR_ADMIN'), async (req, res) => {
  const { email, name, role } = zParse(InviteBody)(req.body);
  const { tenantId } = req.tenant!;

  const user = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
    const found = await tx.user.findUnique({ where: { tenantId_email: { tenantId, email: email.toLowerCase() } } });
    if (found) throw new HttpError(409, 'USER_EXISTS', 'User already exists');
    return tx.user.create({
      data: {
        tenantId,
        email: email.toLowerCase(),
        name,
        role,
        invitedAt: new Date(),
        // temporary random hash; will set real password via a reset flow later
        passwordHash: await hashPassword(crypto.randomBytes(16).toString('hex')),
      },
    });
  });

  return res.json({ invitedUserId: user.id, email: user.email, role: user.role });
});

export default router;
