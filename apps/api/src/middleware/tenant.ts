import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db.js';
import { HttpError } from '../errors.js';

export type TenantContext = { tenantId: string; tenantSlug: string };
declare module 'express-serve-static-core' {
  interface Request {
    tenant?: TenantContext;
  }
}

function extractSubdomain(host?: string): string | null {
  if (!host) return null;
  const h = host.toLowerCase().split(':')[0];
  // dev assumption: <slug>.localhost or <slug>.lvh.me or localhost
  if (h === 'localhost') return null;
  const parts = h.split('.');
  if (parts.length >= 2 && parts[0] !== 'www') { // Treat www.acme.com as acme.com
    return parts[0]; // slug.somedomain.tld
  }
  return null;
}

export async function tenantResolver(req: Request, _res: Response, next: NextFunction) {
  // Test shortcut: bypass DB lookup
  if (process.env.NODE_ENV === 'test') {
    const testTid = req.header('x-tenant-test');
    if (testTid) {
      req.tenant = { tenantId: testTid, tenantSlug: 'test' };
      return next();
    }
  }
  
  const header = (req.header('x-tenant-id') || '').trim();
  const byHeader = header || null;
  const bySub = extractSubdomain(req.headers.host);
  const slugOrId = byHeader || bySub;

  if (!slugOrId) {
    throw new HttpError(400, 'TENANT_REQUIRED', 'Tenant not provided (x-tenant-id header or subdomain).');
  }

  // Accept slug first, then try UUID
  const tenant =
    (await prisma.tenant.findUnique({ where: { slug: slugOrId } })) ||
    (await prisma.tenant.findUnique({ where: { id: slugOrId } }));

  if (!tenant) {
    throw new HttpError(404, 'TENANT_NOT_FOUND', 'Tenant not found');
  }

  req.tenant = { tenantId: tenant.id, tenantSlug: tenant.slug };
  next();
}
