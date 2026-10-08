import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";

const MAX_MESSAGES = 15;
const WINDOW_MS = 60_000;

/**
 * Max 15 messages per minute per user. Counted in the database (no in-memory state), so it holds
 * across restarts. Runs in the transaction that inserts the message, after a per-user advisory lock:
 * parallel sends are counted one after the other and can't all see the same count.
 */
export async function assertCanSendMessage(tx: Prisma.TransactionClient, userId: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`chat-send:${userId}`}))`;
  const recent = await tx.message.count({
    where: { senderId: userId, createdAt: { gt: new Date(Date.now() - WINDOW_MS) } },
  });
  if (recent >= MAX_MESSAGES) {
    throw new AppError("Tu envoies trop de messages. Patiente une minute.", 429);
  }
}
