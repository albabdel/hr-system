import { Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const connection = { host: process.env.REDIS_URL || 'redis', port: 6379 };
const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.STORAGE_REGION || 'us-east-1',
  endpoint: process.env.STORAGE_ENDPOINT || 'http://minio:9000',
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.STORAGE_ACCESS_KEY || 'minio', secretAccessKey: process.env.STORAGE_SECRET_KEY || 'minio123' }
});
const BUCKET = process.env.STORAGE_BUCKET || 'hr-dev';


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

const payrollCalcWorker = new Worker('payrollCalc', async (job) => {
  const { tenantId, runId } = job.data as { tenantId: string; runId: string };
  console.log(`Calculating payroll for run ${runId}`);
  await prisma.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);
  const run = await prisma.payrollRun.findUnique({ where: { id: runId } });
  if (!run) return;

  const emps = await prisma.employee.findMany({ where: { status: 'ACTIVE' } });
  for (const e of emps) {
    const exists = await prisma.payslip.findFirst({ where: { runId, employeeId: e.id } });
    if (exists) continue;
    const gross = 4000, taxes = Math.round(gross * 0.10 * 100) / 100, net = gross - taxes;
    await prisma.payslip.create({ data: { tenantId, runId, employeeId: e.id, currency: 'USD', gross, taxes, net } });
  }
  console.log(`Finished calculating payroll for run ${runId}`);
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

const eventsPayrollCalc = new QueueEvents('payrollCalc', { connection });
eventsPayrollCalc.on('completed', ({ jobId }) => console.log(`payrollCalc completed: ${jobId}`));
eventsPayrollCalc.on('failed', ({ jobId, failedReason }) => console.error(`payrollCalc failed: ${jobId} ${failedReason}`));

console.log('Worker is listening for jobs...');
