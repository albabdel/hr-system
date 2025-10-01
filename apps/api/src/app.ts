import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import { prisma } from './db.js';
import { verifyRlsOrExit } from './rls.js';
import { errorMiddleware } from './errors.js';
import authRouter from './routes/auth.js';
import probeRouter from './routes/probe.js';
import employeesRouter from './routes/employees.js';
import { mountDocs } from './openapi.js';

export function createApp() {
  const app = express();
  const log = pino({ name: 'api', level: process.env.NODE_ENV === 'test' ? 'silent' : 'info' });

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/healthz', async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true });
  });

  app.use('/auth', authRouter);
  app.use('/v1/probe', probeRouter);
  app.use('/v1/employees', employeesRouter);

  mountDocs(app);
  app.use(errorMiddleware);

  async function boot(port: number) {
    if (process.env.NODE_ENV !== 'test') {
      await prisma.$connect();
      await verifyRlsOrExit();
    }
    app.listen(port, () => {
      if (process.env.NODE_ENV !== 'test') {
        log.info({ port }, 'API listening');
      }
    });
  }

  return { app, boot, log };
}
