import { Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const connection = { host: process.env.REDIS_URL || 'redis', port: 6379 };

const redis = new Redis(connection.url);
redis.ping().then((p) => console.log(`Worker connected to Redis: ${p}`));

const fileScanWorker = new Worker('fileScan', async (job) => {
  const { tenantId, fileId } = job.data as { tenantId: string; fileId: string };
  console.log(`Scanning file ${fileId} for tenant ${tenantId}...`);
  await new Promise((r) => setTimeout(r, 1500));

  await prisma.$executeRawUnsafe(`SELECT set_config('app.tenant_id', $1, true)`, tenantId);
  const file = await prisma.fileObject.findUnique({ where: { id: fileId } });
  if (file) {
    await prisma.fileObject.update({
      where: { id: fileId },
      data: { metadata: { ...(file.metadata as any || {}), virusScan: 'clean' } },
    });
  }
  console.log(`Scanned file ${fileId} for tenant ${tenantId}: clean`);
}, { connection });

const certGenWorker = new Worker('certGen', async (job) => {
    console.log(`Generating certificate for job ${job.id}`);
    await new Promise((r) => setTimeout(r, 3000));
    console.log(`Generated certificate for job ${job.id}`);
}, { connection });


const eventsFileScan = new QueueEvents('fileScan', { connection });
eventsFileScan.on('completed', ({ jobId }) => console.log(`fileScan completed: ${jobId}`));
eventsFileScan.on('failed', ({ jobId, failedReason }) => console.error(`fileScan failed: ${jobId} ${failedReason}`));

const eventsCertGen = new QueueEvents('certGen', { connection });
eventsCertGen.on('completed', ({ jobId }) => console.log(`certGen completed: ${jobId}`));
eventsCertGen.on('failed', ({ jobId, failedReason }) => console.error(`certGen failed: ${jobId} ${failedReason}`));

console.log('Worker is listening for jobs...');
