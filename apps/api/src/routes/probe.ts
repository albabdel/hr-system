import { Router } from 'express';
import { tenantResolver } from '../middleware/tenant.js';
import { requireAuth } from '../middleware/auth.js';
import { rbacGuard } from '../rbac/guard.js';
import { Action } from '../rbac/types.js';

const router = Router();

// Simulated employee read — uses :userId as the "subject".
router.get(
  '/employee/:userId',
  tenantResolver,
  requireAuth,
  rbacGuard(Action.EMPLOYEE_READ, (req) => ({ targetUserId: req.params.userId })),
  (_req, res) => {
    res.json({ ok: true, action: Action.EMPLOYEE_READ });
  },
);

// Simulated employee create.
router.post(
  '/employee',
  tenantResolver,
  requireAuth,
  rbacGuard(Action.EMPLOYEE_CREATE),
  (_req, res) => {
    res.status(201).json({ ok: true, action: Action.EMPLOYEE_CREATE });
  },
);

// Simulated employee delete.
router.delete(
  '/employee/:id',
  tenantResolver,
  requireAuth,
  rbacGuard(Action.EMPLOYEE_DELETE),
  (_req, res) => {
    res.status(204).send();
  },
);

export default router;
