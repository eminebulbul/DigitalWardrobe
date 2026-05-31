import "dotenv/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const S3_BUCKET = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION || "us-east-1";
const S3_ENDPOINT = process.env.S3_ENDPOINT || null;
const S3_PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL || null;
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;

export const s3Client = S3_BUCKET && S3_ACCESS_KEY && S3_SECRET_KEY
  ? new S3Client({
    region: S3_REGION,
    endpoint: S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
  })
  : null;

export function isS3ImageUrl(imageUrl) {
  return Boolean(S3_ENDPOINT && imageUrl && imageUrl.startsWith(S3_ENDPOINT.replace(/\/$/, "")));
}

export function toPublicImageUrl(imageUrl) {
  if (!imageUrl) {
    return imageUrl;
  }

  if (!S3_PUBLIC_BASE_URL || !S3_ENDPOINT) {
    return imageUrl;
  }

  const privateBase = S3_ENDPOINT.replace(/\/$/, "");
  const publicBase = S3_PUBLIC_BASE_URL.replace(/\/$/, "");

  if (!imageUrl.startsWith(privateBase)) {
    return imageUrl;
  }

  const key = imageUrl.slice(privateBase.length).replace(/^\/+/, "");
  return `${publicBase}/${key}`;
}

export function extractS3KeyFromImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  try {
    const url = new URL(imageUrl);
    return url.pathname.replace(/^\/+/, "");
  } catch (error) {
    return imageUrl.replace(/^\/+/, "");
  }
}

export {
  PutObjectCommand,
  GetObjectCommand,
  S3_BUCKET,
  S3_REGION,
  S3_ENDPOINT,
  S3_PUBLIC_BASE_URL,
};
