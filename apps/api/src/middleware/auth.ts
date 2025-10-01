import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { HttpError } from '../errors.js';
import type { Role } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { userId: string; role: Role };
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError(401, 'UNAUTHORIZED', 'Missing access token');

  try {
    const claims = verifyToken<{ sub: string; role: string; tid: string; typ: string }>(token);
    if (claims.typ !== 'access') throw new Error('wrong typ');
    if (!req.tenant || req.tenant.tenantId !== claims.tid) {
      throw new HttpError(403, 'TENANT_MISMATCH', 'Token tenant mismatch');
    }
    req.user = { userId: claims.sub, role: claims.role as any };
    next();
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
}

export function requireRoles(...roles: Array<Role>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Missing user');
    if (!roles.includes(req.user.role)) throw new HttpError(403, 'FORBIDDEN', 'Insufficient role');
    next();
  };
}
