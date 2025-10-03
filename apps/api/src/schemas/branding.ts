import { z } from 'zod';
import { registry } from '../openapi.js';

export const BrandingPut = z.object({
  brandName: z.string().min(1).max(64),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  accentColor: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  sidebarBg: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  sidebarText: z.string().regex(/^#([0-9a-fA-F]{6})$/),
  scheme: z.enum(['SYSTEM','LIGHT','DARK'])
});

registry.register('BrandingPut', BrandingPut);
