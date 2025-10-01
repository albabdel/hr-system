import type { Request, Response, NextFunction } from 'express';
import { Action, Scope, SubjectContext } from './types.js';
import { getPermission } from './matrix.js';
import { HttpError } from '../errors.js';

type CtxResolver = (req: Request) => SubjectContext;

function isAllowed(scope: Scope, req: Request, ctx: SubjectContext): boolean {
  switch (scope) {
    case Scope.ALL:
      return true;
    case Scope.TENANT:
      // Tenant scoping is enforced by RLS. If request has a tenant, allow.
      return Boolean(req.tenant?.tenantId);
    case Scope.OWN:
      return Boolean(req.user?.userId && ctx.targetUserId && req.user.userId === ctx.targetUserId);
    default:
      return false;
  }
}

export function rbacGuard(action: Action, getCtx?: CtxResolver) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new HttpError(401, 'UNAUTHORIZED', 'Missing user');
    const perm = getPermission(req.user.role, action);
    if (!perm) throw new HttpError(403, 'FORBIDDEN', 'Not permitted');

    const ctx = getCtx ? getCtx(req) : {};
    if (!isAllowed(perm.scope, req, ctx)) {
      throw new HttpError(403, 'FORBIDDEN', 'Scope check failed');
    }
    next();
  };
}
