import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';
import { zParse } from '../errors.js';
import { BrandingPut } from '../schemas/branding.js';
import { prisma } from '../db.js';
import { registry } from '../openapi.js';

const router = Router();

registry.registerPath({ method: 'get', path: '/v1/branding', tags: ['branding'], responses: { 200: { description: 'OK' } } });
router.get('/', tenantResolver, requireAuth, async (req, res) => {
  const { tenantId } = req.tenant!;
  const row = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.tenantBranding.findUnique({ where: { tenantId } });
  });
  res.json(row ?? {
    brandName: 'HR SaaS',
    logoUrl: null,
    primaryColor: '#0ea5e9',
    accentColor: '#22c55e',
    sidebarBg: '#ffffff',
    sidebarText: '#111827',
    scheme: 'SYSTEM'
  });
});

registry.registerPath({
  method: 'put', path: '/v1/branding', tags: ['branding'],
  request: { body: { content: { 'application/json': { schema: BrandingPut } } } },
  responses: { 200: { description: 'OK' } }
});
router.put('/', tenantResolver, requireAuth, rbacGuard(Action.THEME_MANAGE), async (req, res) => {
  const { tenantId } = req.tenant!;
  const body = zParse(BrandingPut)(req.body);
  const saved = await prisma.$transaction(async (tx)=>{
    await tx.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
    return tx.tenantBranding.upsert({
      where: { tenantId },
      update: body,
      create: { tenantId, ...body }
    });
  });
  res.json(saved);
});

export default router;
