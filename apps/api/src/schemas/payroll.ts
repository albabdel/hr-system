import { z } from 'zod';
import { registry } from '../openapi.js';

export const CalendarCreate = z.object({
  name: z.string().min(2),
  frequency: z.enum(['MONTHLY','BIWEEKLY','WEEKLY','CUSTOM']),
  dayOfMonth: z.number().int().min(1).max(28).optional(),
  cutoffOffsetDays: z.number().int().min(-15).max(0).optional()
});
export const RunCreate = z.object({
  calendarId: z.string().uuid(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime()
});

export const RunId = z.object({ id: z.string().uuid() });

registry.register('CalendarCreate', CalendarCreate);
registry.register('RunCreate', RunCreate);
