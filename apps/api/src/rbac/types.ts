export type Role = 'OWNER' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

export enum Action {
  EMPLOYEE_READ = 'employee:read',
  EMPLOYEE_CREATE = 'employee:create',
  EMPLOYEE_UPDATE = 'employee:update',
  EMPLOYEE_DELETE = 'employee:delete',
  LEAVE_APPROVE = 'leave:approve',
  PAYROLL_RUN = 'payroll:run',
  USER_INVITE = 'user:invite',
  TIME_CLOCK = 'time:clock',
  LEAVE_REQUEST_CREATE = 'leave:request:create',
  LEAVE_REQUEST_READ = 'leave:request:read',
  LEAVE_REQUEST_CANCEL = 'leave:request:cancel',
  LEAVE_TYPE_MANAGE = 'leave:type:manage',
  HOLIDAY_MANAGE = 'holiday:manage',
  BILLING_MANAGE = 'billing:manage',
  INTEGRATION_MANAGE = 'integration:manage',
  // NEW
  THEME_MANAGE = 'theme:manage'
}

export enum Scope { OWN = 'own', TENANT = 'tenant', ALL = 'all' }
export type Permission = { action: Action; scope: Scope };
export type SubjectContext = { targetUserId?: string };
