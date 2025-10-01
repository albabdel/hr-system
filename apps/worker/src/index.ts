import { Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const connection = { url: process.env.REDIS_URL || 'redis://redis:6379' };

// Keep old Redis ping log
const redis = new Redis(connection.url);
redis.ping().then((p) => console.log(`Worker connected to Redis: ${p}`));

const fileScanWorker = new Worker('fileScan', async (job) => {
  const { tenantId, fileId } = job.data as { tenantId: string; fileId: string };
  console.log(`Scanning file ${fileId} for tenant ${tenantId}...`);
  // Simulate scan delay
  await new Promise((r) => setTimeout(r, 1500));

  await prisma.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
  await prisma.fileObject.update({
    where: { id: fileId },
    data: {
      metadata: { ...(job.data.metadata || {}), virusScan: 'clean' },
    },
  });
  console.log(`Scanned file ${fileId} for tenant ${tenantId}: clean`);
}, { connection });

const events = new QueueEvents('fileScan', { connection });
events.on('completed', ({ jobId }) => console.log(`fileScan completed: ${jobId}`));
events.on('failed', ({ jobId, failedReason }) => console.error(`fileScan failed: ${jobId} ${failedReason}`));

console.log('Worker is listening for fileScan jobs...');
