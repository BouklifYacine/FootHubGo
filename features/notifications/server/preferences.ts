import { prisma } from "@/prisma";
import { appSecret } from "@/lib/signed-token";
import { readUnsubscribeToken } from "../unsubscribe";

/** Turns the reminder emails off for the user named by a valid unsubscribe token. */
export async function unsubscribeWithToken(token: string | null | undefined) {
  const userId = readUnsubscribeToken(token, appSecret());
  if (!userId) return { ok: false as const };
  // updateMany: a deleted account is not an error.
  await prisma.user.updateMany({ where: { id: userId }, data: { emailReminders: false } });
  return { ok: true as const };
}
