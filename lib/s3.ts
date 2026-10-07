import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL_S3 || "https://fly.storage.tigris.dev",
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const S3_BUCKET = process.env.S3_BUCKET_NAME ?? "";

/** Public URL of an object (virtual-hosted style, the bucket is public-read). */
export function publicObjectUrl(key: string) {
  const endpoint = new URL(process.env.AWS_ENDPOINT_URL_S3 || "https://fly.storage.tigris.dev");
  return `${endpoint.protocol}//${S3_BUCKET}.${endpoint.host}/${key}`;
}

/** Inverse of `publicObjectUrl`; null for URLs that are not in our bucket (e.g. OAuth avatars). */
export function objectKeyFromUrl(url: string) {
  try {
    const { host, pathname } = new URL(url);
    if (!host.startsWith(`${S3_BUCKET}.`)) return null;
    return decodeURIComponent(pathname.slice(1)) || null;
  } catch {
    return null;
  }
}
