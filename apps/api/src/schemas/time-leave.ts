import { z } from 'zod';
import { registry } from '../openapi.js';

export const DateISO = z.string().datetime();
export const DateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const TimeClockRange = z.object({
  from: DateISO.optional(),
  to: DateISO.optional()
});
export const LeaveTypeBody = z.object({
  name: z.string().min(2),
  code: z.string().regex(/^[A-Z0-9_]{2,20}$/),
  daysPerYear: z.number().positive().default(20),
  allowHalfDays: z.boolean().default(true),
  allowOnHolidays: z.boolean().default(false),
  requiresApproval: z.boolean().default(true)
});
export const LeaveTypeUpdate = LeaveTypeBody.partial();

export const LeaveRequestCreate = z.object({
  typeId: z.string().uuid(),
  startDate: DateOnly,
  endDate: DateOnly,
  hours: z.number().positive().max(12).optional(),
  reason: z.string().max(500).optional()
});

export const LeaveQuery = z.object({
  userId: z.string().uuid().optional(),
  status: z.enum(['PENDING','APPROVED','REJECTED','CANCELED']).optional(),
  from: DateOnly.optional(),
  to: DateOnly.optional()
});

export const HolidayBody = z.object({
  date: DateOnly,
  name: z.string().min(2)
});

registry.register('LeaveTypeBody', LeaveTypeBody);
registry.register('LeaveRequestCreate', LeaveRequestCreate);
