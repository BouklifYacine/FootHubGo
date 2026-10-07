import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { avatarPrefix, ownedAvatarKey, s3, S3_BUCKET } from "@/lib/s3";

/**
 * Avatar clean-up. Only keys under `avatars/<userId>/` of the session user are ever deleted:
 * never a key taken as-is from a URL (OAuth avatars and other users' objects are left alone).
 * Never throws: a storage failure must not break the action.
 */
export async function deleteOwnAvatar(url: string | null | undefined, userId: string) {
  const key = ownedAvatarKey(url, userId);
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })).catch((error) => {
    console.error("[avatar] delete failed", key, error instanceof Error ? error.message : error);
  });
}

/** Deletes every stored avatar of a user (account deletion). */
export async function deleteAllAvatars(userId: string) {
  try {
    const { Contents = [] } = await s3.send(
      new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: avatarPrefix(userId), MaxKeys: 1000 }),
    );
    const keys = Contents.flatMap((object) => (object.Key ? [{ Key: object.Key }] : []));
    if (keys.length === 0) return;
    await s3.send(new DeleteObjectsCommand({ Bucket: S3_BUCKET, Delete: { Objects: keys, Quiet: true } }));
  } catch (error) {
    console.error("[avatar] clean-up failed", userId, error instanceof Error ? error.message : error);
  }
}
