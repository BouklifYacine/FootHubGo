import { prisma } from "@/prisma";
import { AppError, forbidden, notFound } from "@/lib/errors";

/**
 * The caller's participation in a conversation (with the conversation type), or 404.
 * 404 rather than 403 so ids of conversations you are not in don't leak.
 */
export async function requireParticipant(userId: string, conversationId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { userId_conversationId: { userId, conversationId } },
    include: { conversation: { select: { id: true, type: true, teamId: true } } },
  });
  if (!participant) throw notFound("Conversation introuvable");
  return participant;
}

/** Same as `requireParticipant`, for a GROUP conversation the caller administers. */
export async function requireGroupAdmin(userId: string, conversationId: string) {
  const participant = await requireParticipant(userId, conversationId);
  if (participant.conversation.type !== "GROUP") {
    throw new AppError("Action réservée aux groupes");
  }
  if (participant.role !== "ADMIN") throw forbidden("Seul l'administrateur du groupe peut faire cela");
  return participant;
}

/** DMs and groups are limited to members of the caller's team. */
export async function assertTeammates(teamId: string, userIds: string[]) {
  const unique = [...new Set(userIds)];
  const count = await prisma.teamMember.count({ where: { teamId, userId: { in: unique } } });
  if (count !== unique.length) throw forbidden("Vous ne pouvez discuter qu'avec les membres de votre club");
}

/** Throws if a block exists in either direction between `userId` and one of `otherIds`. */
export async function assertNotBlocked(userId: string, otherIds: string[]) {
  if (otherIds.length === 0) return;
  const blocked = await prisma.user.count({
    where: {
      id: { in: otherIds },
      OR: [{ blockedUsers: { some: { id: userId } } }, { blockedBy: { some: { id: userId } } }],
    },
  });
  if (blocked > 0) throw forbidden("Impossible de discuter avec un utilisateur bloqué");
}
