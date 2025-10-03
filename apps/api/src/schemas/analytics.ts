import { z } from 'zod';
import { registry } from '../openapi.js';

export const DateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const GroupBy = z.enum(['day','month']);

export const RangeQuery = z.object({
  from: DateOnly.optional(),
  to: DateOnly.optional(),
  groupBy: GroupBy.optional()
});

export const ExportCreate = z.object({
  type: z.enum(['headcount','payroll-cost']),
  from: DateOnly.optional(),
  to: DateOnly.optional(),
  groupBy: GroupBy.optional(),
  format: z.enum(['csv']).default('csv')
});

export const ExportId = z.object({ id: z.string().uuid() });

registry.register('AnalyticsRangeQuery', RangeQuery);
registry.register('AnalyticsExportCreate', ExportCreate);
