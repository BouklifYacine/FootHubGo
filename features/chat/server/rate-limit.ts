import { prisma } from "@/prisma";
import { AppError } from "@/lib/errors";

const MAX_MESSAGES = 15;
const WINDOW_MS = 60_000;

/**
 * Max 15 messages per minute per user. Counted in the database (no in-memory state),
 * so it holds across restarts. Call it after input validation.
 */
export async function assertCanSendMessage(userId: string) {
  const recent = await prisma.message.count({
    where: { senderId: userId, createdAt: { gt: new Date(Date.now() - WINDOW_MS) } },
  });
  if (recent >= MAX_MESSAGES) {
    throw new AppError("Tu envoies trop de messages. Patiente une minute.", 429);
  }
}
