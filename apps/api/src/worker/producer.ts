import { Queue } from 'bullmq';

const connection = { host: 'redis', port: 6379 };
export const fileScanQueue = new Queue('fileScan', { connection });
export const payrollCalcQueue = new Queue('payrollCalc', { connection });
export const certGenQueue = new Queue('certGen', { connection });

export async function enqueueFileScan(payload: { tenantId: string; fileId: string; objectKey: string }) {
  await fileScanQueue.add('scan', payload, { removeOnComplete: 50, removeOnFail: 50, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}

export async function enqueuePayrollCalc(payload: { tenantId: string; runId: string }) {
  await payrollCalcQueue.add('calc', payload, { removeOnComplete: 100, removeOnFail: 50, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}

export async function enqueueCertGen(payload: { certId: string }) {
  await certGenQueue.add('gen', payload, { removeOnComplete: 100, removeOnFail: 50 });
}
