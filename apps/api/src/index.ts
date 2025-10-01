import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import { prisma } from './db.js';
import { verifyRlsOrExit } from './rls.js';
import { errorMiddleware } from './errors.js';
import authRouter from './routes/auth.js';
import { mountDocs } from './openapi.js';
import { env } from './env.js';

const app = express();
const log = pino({ name: 'api', level: env.NODE_ENV === 'development' ? 'debug' : 'info' });

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.status(200).json({ ok: true });
});

app.use('/auth', authRouter);

mountDocs(app);
app.use(errorMiddleware);

const port = env.PORT || 3000;

async function boot() {
  await prisma.$connect();
  await verifyRlsOrExit();
  app.listen(port, () => {
    log.info({ port }, 'API listening');
  });
}

boot().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
