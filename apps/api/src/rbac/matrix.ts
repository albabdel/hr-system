import { Action, Scope, Permission, Role } from './types.js';

type Matrix = Record<Role, Permission[]>;
export const PERMISSIONS: Matrix = {
  OWNER: [
    { action: Action.EMPLOYEE_READ, scope: Scope.ALL },
    { action: Action.EMPLOYEE_CREATE, scope: Scope.ALL },
    { action: Action.EMPLOYEE_UPDATE, scope: Scope.ALL },
    { action: Action.EMPLOYEE_DELETE, scope: Scope.ALL },
    { action: Action.LEAVE_APPROVE, scope: Scope.ALL },
    { action: Action.PAYROLL_RUN, scope: Scope.ALL },
    { action: Action.USER_INVITE, scope: Scope.ALL }
  ],
  HR_ADMIN: [
    { action: Action.EMPLOYEE_READ, scope: Scope.TENANT },
    { action: Action.EMPLOYEE_CREATE, scope: Scope.TENANT },
    { action: Action.EMPLOYEE_UPDATE, scope: Scope.TENANT },
    { action: Action.EMPLOYEE_DELETE, scope: Scope.TENANT },
    { action: Action.LEAVE_APPROVE, scope: Scope.TENANT },
    { action: Action.PAYROLL_RUN, scope: Scope.TENANT },
    { action: Action.USER_INVITE, scope: Scope.TENANT }
  ],
  MANAGER: [
    { action: Action.EMPLOYEE_READ, scope: Scope.TENANT }, // team will be narrower later
    { action: Action.LEAVE_APPROVE, scope: Scope.TENANT }
  ],
  EMPLOYEE: [
    { action: Action.EMPLOYEE_READ, scope: Scope.OWN }
  ]
};

export function getPermission(role: Role, action: Action): Permission | null {
  const list = PERMISSIONS[role] || [];
  return list.find((p) => p.action === action) ?? null;
}
