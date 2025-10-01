import { z } from 'zod';
import "dotenv/config";

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export type Env = z.infer<typeof EnvSchema>;
export const env: Env = EnvSchema.parse(process.env);
