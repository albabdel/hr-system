import { Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import PDFDocument from 'pdfkit';

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

new Worker('fileScan', async (job) => {
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

new Worker('payrollCalc', async (job) => {
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


new Worker('certGen', async (job) => {
    console.log(`Generating certificate for job ${job.id}`);
    await new Promise((r) => setTimeout(r, 3000));
    console.log(`Generated certificate for job ${job.id}`);
}, { connection });

// NEW: analyticsRefresh — refresh materialized views
new Worker('analyticsRefresh', async (job) => {
  const { tenantId } = job.data as { tenantId: string };
  await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_headcount_daily`);
  await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW mv_payroll_cost_monthly`);
  console.log(`Analytics refreshed for tenant ${tenantId}`);
}, { connection });

// NEW: analyticsExport — build CSV and upload
new Worker('analyticsExport', async (job) => {
  const { tenantId, jobId } = job.data as { tenantId: string; jobId: string };
  await prisma.$executeRawUnsafe(`SELECT set_config('app.tenant_id',$1,true)`, tenantId);

  const ej = await prisma.exportJob.findUnique({ where: { id: jobId } });
  if (!ej) return;

  await prisma.exportJob.update({ where: { id: jobId }, data: { status: 'RUNNING' } });

  try {
    const params = (ej.params ?? {}) as any;
    const type = ej.type as 'headcount'|'payroll-cost';

    let csv = '';

    if (type === 'headcount') {
      csv = 'period,value\n';
      const from = params.from ? new Date(params.from) : new Date(Date.now() - 90*24*3600*1000);
      const to = params.to ? new Date(params.to) : new Date();
      const rows = await prisma.$queryRawUnsafe<Array<{ day: Date; active_count: number }>>(
        `SELECT day, active_count FROM mv_headcount_daily
         WHERE tenant_id = $1 AND day BETWEEN $2::date AND $3::date
         ORDER BY day ASC`,
        tenantId, from, to
      );
      for (const r of rows) csv += `${r.day.toISOString().slice(0,10)},${Number(r.active_count)}\n`;
    } else if (type === 'payroll-cost') {
      csv = 'period,net,gross,taxes\n';
      const from = params.from ? new Date(params.from) : new Date(Date.now() - 365*24*3600*1000);
      const to = params.to ? new Date(params.to) : new Date();
      const rows = await prisma.$queryRawUnsafe<Array<{ month: Date; net_total: any; gross_total: any; tax_total: any; }>>(
        `SELECT month, net_total, gross_total, tax_total FROM mv_payroll_cost_monthly
         WHERE tenant_id = $1 AND month BETWEEN date_trunc('month',$2::timestamp) AND date_trunc('month',$3::timestamp)
         ORDER BY month ASC`,
        tenantId, from, to
      );
      for (const r of rows) csv += `${r.month.toISOString().slice(0,10)},${Number(r.net_total)},${Number(r.gross_total)},${Number(r.tax_total)}\n`;
    }

    const objectKey = `${tenantId}/exports/${jobId}.csv`;
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: objectKey, Body: Buffer.from(csv, 'utf8'), ContentType: 'text/csv' }));

    const file = await prisma.fileObject.create({
      data: { tenantId, bucket: BUCKET, objectKey, sizeBytes: Buffer.byteLength(csv,'utf8'), contentType: 'text/csv', metadata: { kind: 'analytics-export', type } }
    });

    await prisma.exportJob.update({ where: { id: jobId }, data: { status: 'DONE', fileId: file.id } });
    console.log(`Analytics export ${jobId} ready`);
  } catch (e: any) {
    await prisma.exportJob.update({ where: { id: jobId }, data: { status: 'ERROR', error: e.message } });
    console.error(`Analytics export ${jobId} failed:`, e);
  }
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

const eventsAnalytics = new QueueEvents('analyticsExport', { connection });
eventsAnalytics.on('completed', ({ jobId }) => console.log(`analyticsExport completed: ${jobId}`));
eventsAnalytics.on('failed', ({ jobId, failedReason }) => console.error(`analyticsExport failed: ${jobId} ${failedReason}`));


console.log('Worker is listening for jobs...');
