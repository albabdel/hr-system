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
import filesRouter from './routes/files.js';
import empDocsRouter from './routes/employee-documents.js';
import timeClockRouter from './routes/timeclock.js';
import leaveTypesRouter from './routes/leave-types.js';
import leaveRequestsRouter from './routes/leave-requests.js';
import holidaysRouter from './routes/holidays.js';
import lmsRouter from './routes/lms.js';
import payrollCalendarsRouter from './routes/payroll-calendars.js';
import payrollRunsRouter from './routes/payroll-runs.js';
import payslipsRouter from './routes/payslips.js';
import analyticsRouter from './routes/analytics.js';
import { mountDocs } from './openapi.js';
import { ensureBucket } from './storage/s3.js';

export function createApp() {
  const app = express();
  const log = pino({ name: 'api', level: process.env.NODE_ENV === 'test' ? 'silent' : 'info' });

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '5mb' }));

  app.get('/healthz', async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true });
  });

  app.use('/auth', authRouter);
  app.use('/v1/probe', probeRouter);
  app.use('/v1/employees', employeesRouter);
  app.use('/v1/files', filesRouter);
  app.use('/v1/employees', empDocsRouter);
  app.use('/v1/time/clock', timeClockRouter);
  app.use('/v1/leave', leaveTypesRouter);
  app.use('/v1/leave', leaveRequestsRouter);
  app.use('/v1/holidays', holidaysRouter);
  app.use('/v1/lms', lmsRouter);
  app.use('/v1/payroll', payrollCalendarsRouter);
  app.use('/v1/payroll', payrollRunsRouter);
  app.use('/v1/payslips', payslipsRouter);
  app.use('/v1/analytics', analyticsRouter);

  mountDocs(app);
  app.use(errorMiddleware);

  async function boot(port: number) {
    if (process.env.NODE_ENV !== 'test') {
      await prisma.$connect();
      await verifyRlsOrExit();
      await ensureBucket();
    }
    app.listen(port, () => {
      if (process.env.NODE_ENV !== 'test') {
        log.info({ port }, 'API listening');
      }
    });
  }

  return { app, boot, log };
}
