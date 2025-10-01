export type Role = 'OWNER' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export enum Action {
  EMPLOYEE_READ = 'employee:read',
  EMPLOYEE_CREATE = 'employee:create',
  EMPLOYEE_UPDATE = 'employee:update',
  EMPLOYEE_DELETE = 'employee:delete',
  LEAVE_APPROVE = 'leave:approve',
  PAYROLL_RUN = 'payroll:run',
  USER_INVITE = 'user:invite'
}

export enum Scope {
  OWN = 'own',
  TENANT = 'tenant',
  ALL = 'all'
}

export type Permission = { action: Action; scope: Scope };

export type SubjectContext = {
  // Optional IDs involved in the request, used for scope checks.
  targetUserId?: string;
};
