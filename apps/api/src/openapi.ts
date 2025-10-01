import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import type { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import { env } from './env.js';

export const registry = new OpenAPIRegistry();

export function mountDocs(app: Express) {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const doc = generator.generateDocument({
    openapi: '3.0.3',
    info: { title: 'HR SaaS API', version: '1.0.0' },
    servers: [{ url: env.API_URL }],
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(doc));
  app.get('/openapi.json', (_req: Request, res: Response) => res.json(doc));
}
