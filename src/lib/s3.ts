import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT!;
const region = process.env.S3_REGION || "auto";
export const BUCKET = process.env.S3_BUCKET!;
const creds = {
  accessKeyId: process.env.S3_ACCESS_KEY!,
  secretAccessKey: process.env.S3_SECRET_KEY!,
};

export const s3 = new S3Client({
  region,
  endpoint,
  credentials: creds,
  forcePathStyle: true, // works for MinIO and many S3 compatibles
});

export async function signPutUrl(key: string, contentType: string) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET, Key: key, ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn: 60 * 5 });
}
