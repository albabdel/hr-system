import { env } from '../env.js';
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3 = new S3Client({
  region: env.STORAGE_REGION,
  endpoint: env.STORAGE_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.STORAGE_ACCESS_KEY,
    secretAccessKey: env.STORAGE_SECRET_KEY,
  },
});

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.STORAGE_BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: env.STORAGE_BUCKET }));
  }
}

export async function presignPut(objectKey: string, contentType: string, expiresSeconds = 300) {
  const cmd = new PutObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: objectKey,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: expiresSeconds });
  return url;
}

export async function presignGet(objectKey: string, expiresSeconds = 300) {
  const cmd = new GetObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: objectKey,
  });
  const url = await getSignedUrl(s3, cmd, { expiresIn: expiresSeconds });
  return url;
}
