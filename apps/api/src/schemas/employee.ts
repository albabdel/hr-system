import { z } from 'zod';
import { registry } from '../openapi.js';

export const EmployeeStatus = z.enum(['ACTIVE','INACTIVE','ON_LEAVE']);

export const EmployeeBase = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  position: z.string().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  hiredAt: z.string().datetime().nullable().optional(),
  status: EmployeeStatus.default('ACTIVE'),
});

export const EmployeeCreate = EmployeeBase;
export const EmployeeUpdate = EmployeeBase.partial();

export const EmployeeResponse = EmployeeBase.extend({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const EmployeeListQuery = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional(),
  departmentId: z.string().uuid().optional(),
  status: EmployeeStatus.optional(),
});

registry.register('EmployeeResponse', EmployeeResponse);
registry.register('EmployeeCreate', EmployeeCreate);
registry.register('EmployeeUpdate', EmployeeUpdate);
