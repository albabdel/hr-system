import { Queue } from 'bullmq';

const connection = { host: 'redis', port: 6379 };

export const fileScanQueue = new Queue('fileScan', { connection });
export async function enqueueFileScan(payload: { tenantId: string; fileId: string; objectKey: string }) {
  await fileScanQueue.add('scan', payload, { removeOnComplete: 50, removeOnFail: 50, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}

export const payrollCalcQueue = new Queue('payrollCalc', { connection });
export async function enqueuePayrollCalc(payload: { tenantId: string; runId: string }) {
  await payrollCalcQueue.add('calc', payload, { removeOnComplete: 100, removeOnFail: 50, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}

// NEW
export const analyticsRefreshQueue = new Queue('analyticsRefresh', { connection });
export async function enqueueAnalyticsRefresh(payload: { tenantId: string }) {
  await analyticsRefreshQueue.add('refresh', payload, { removeOnComplete: 50, attempts: 2, backoff: { type: 'fixed', delay: 1000 } });
}

export const analyticsExportQueue = new Queue('analyticsExport', { connection });
export async function enqueueAnalyticsExport(payload: { tenantId: string; jobId: string }) {
  await analyticsExportQueue.add('export', payload, { removeOnComplete: 100, attempts: 3, backoff: { type: 'exponential', delay: 1500 } });
}
