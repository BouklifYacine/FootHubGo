"use server";

import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { requireMember, requireUser } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { emitToUsers, leaveConversationRoom } from "@/server/realtime/emitter";
import {
  blockUserSchema,
  conversationIdSchema,
  createConversationSchema,
  pinConversationSchema,
} from "../schemas";
import { assertNotBlocked, assertTeammates, requireParticipant } from "../server/access";
import { conversationInclude, toConversationDto } from "../server/dto";

/** Opens (or reuses) a private conversation, or creates a group, with members of the caller's team. */
const conversationBudget = rateLimiter("conversations", { max: 20, windowMs: 60 * 60_000 });

export const createConversation = action(createConversationSchema, async (input) => {
  const { user, membership } = await requireMember();
  enforceRateLimit([[conversationBudget, user.id]], "Trop de conversations créées. Réessayez plus tard.");
  const otherIds = input.type === "PRIVATE" ? [input.userId] : [...new Set(input.userIds)];
  if (otherIds.includes(user.id)) throw new AppError("Vous ne pouvez pas vous ajouter vous-même");

  await assertTeammates(membership.clubId, otherIds);
  await assertNotBlocked(user.id, otherIds);

  if (input.type === "PRIVATE") {
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "PRIVATE",
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: input.userId } } },
        ],
      },
      include: conversationInclude(user.id),
    });
    if (existing) {
      return { message: "Conversation ouverte", data: toConversationDto(existing, user.id) };
    }
  }

  const isGroup = input.type === "GROUP";
  const conversation = await prisma.conversation.create({
    data: {
      type: input.type,
      name: isGroup ? input.name : null,
      creatorId: isGroup ? user.id : null,
      participants: {
        create: [
          { userId: user.id, role: isGroup ? "ADMIN" : "MEMBER" },
          ...otherIds.map((userId) => ({ userId, role: "MEMBER" as const })),
        ],
      },
    },
    include: conversationInclude(user.id),
  });

  emitToUsers(otherIds, "chat:conversation_updated", { conversationId: conversation.id });
  return {
    message: isGroup ? "Groupe créé" : "Conversation créée",
    // No block can exist here (checked above), so the default `blocked` flags are accurate.
    data: toConversationDto(conversation, user.id),
  };
});

/** Pinning is personal: it only changes the caller's sidebar. */
export const pinConversation = action(pinConversationSchema, async ({ conversationId, pinned }) => {
  const user = await requireUser();
  const { count } = await prisma.conversationParticipant.updateMany({
    where: { userId: user.id, conversationId },
    data: { isPinned: pinned },
  });
  if (count === 0) throw notFound("Conversation introuvable");
  return { message: pinned ? "Conversation épinglée" : "Conversation désépinglée" };
});

/** Private conversations: any participant. Groups: the admin. Team channels: never. */
export const deleteConversation = action(conversationIdSchema, async (conversationId) => {
  const user = await requireUser();
  const participant = await requireParticipant(user.id, conversationId);
  const { type } = participant.conversation;

  if (type === "TEAM" || type === "CLUB") throw forbidden("Les salons du club et des sections ne peuvent pas être supprimés");
  if (type === "GROUP" && participant.role !== "ADMIN") {
    throw forbidden("Seul l'administrateur peut supprimer le groupe");
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  await prisma.conversation.delete({ where: { id: conversationId } });

  const userIds = participants.map((p) => p.userId);
  emitToUsers(userIds, "chat:conversation_removed", { conversationId });
  leaveConversationRoom(userIds, conversationId);
  return { message: type === "GROUP" ? "Groupe supprimé" : "Conversation supprimée" };
});

export const setUserBlocked = action(blockUserSchema, async ({ userId: targetId, blocked }) => {
  const user = await requireUser();
  if (targetId === user.id) throw new AppError("Vous ne pouvez pas vous bloquer vous-même");

  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } });
  if (!target) throw notFound("Utilisateur introuvable");

  await prisma.user.update({
    where: { id: user.id },
    data: { blockedUsers: blocked ? { connect: { id: targetId } } : { disconnect: { id: targetId } } },
  });

  // Both sides refresh their private conversation (input locked / unlocked).
  const conversation = await prisma.conversation.findFirst({
    where: {
      type: "PRIVATE",
      AND: [{ participants: { some: { userId: user.id } } }, { participants: { some: { userId: targetId } } }],
    },
    select: { id: true },
  });
  if (conversation) {
    emitToUsers([user.id, targetId], "chat:conversation_updated", { conversationId: conversation.id });
  }
  return { message: blocked ? "Utilisateur bloqué" : "Utilisateur débloqué" };
});
