import { S3Client } from "@aws-sdk/client-s3";

const DEFAULT_ENDPOINT = "https://fly.storage.tigris.dev";

export const s3 = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL_S3 || DEFAULT_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const S3_BUCKET = process.env.S3_BUCKET_NAME ?? "";

const endpoint = new URL(process.env.AWS_ENDPOINT_URL_S3 || DEFAULT_ENDPOINT);
/** Public base URL of the bucket (virtual-hosted style, the bucket is public-read). */
export const PUBLIC_BASE_URL = `${endpoint.protocol}//${S3_BUCKET}.${endpoint.host}/`;

export function publicObjectUrl(key: string) {
  return `${PUBLIC_BASE_URL}${key}`;
}

/** Folder of a user's avatars: the only keys the app ever deletes for that user. */
export const avatarPrefix = (userId: string) => `avatars/${userId}/`;

/**
 * The bucket key of `url` when it is one of `userId`'s avatars (`avatars/<userId>/<file>` on our
 * bucket's exact host), else null. Pure. A URL pointing at another user's object, another
 * folder or another host (OAuth avatars) is never turned into a key to delete.
 */
export function ownedAvatarKey(url: string | null | undefined, userId: string, baseUrl = PUBLIC_BASE_URL) {
  if (!url || !userId) return null;
  try {
    const parsed = new URL(url);
    const base = new URL(baseUrl);
    if (parsed.protocol !== base.protocol || parsed.host !== base.host) return null;
    const key = decodeURIComponent(parsed.pathname.slice(1));
    const prefix = avatarPrefix(userId);
    const file = key.slice(prefix.length);
    if (!key.startsWith(prefix) || !file || file.includes("/") || file.includes("..")) return null;
    return key;
  } catch {
    return null;
  }
}
