import { Queue } from 'bullmq';

const connection = { host: 'redis', port: 6379 };
export const fileScanQueue = new Queue('fileScan', { connection });

export async function enqueueFileScan(payload: { tenantId: string; fileId: string; objectKey: string }) {
  await fileScanQueue.add('scan', payload, { removeOnComplete: 50, removeOnFail: 50, attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}
