"use server";

import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { findMembership, requireUser } from "@/lib/auth/session";
import { forbidden, notFound } from "@/lib/errors";
import { emitToConversation, emitToUser } from "@/server/realtime/emitter";
import { conversationIdSchema, deleteMessageSchema, sendMessageSchema } from "../schemas";
import { assertNotBlocked, requireParticipant } from "../server/access";
import { messageInclude, toMessageDto } from "../server/dto";
import { assertCanSendMessage } from "../server/rate-limit";

export const sendMessage = action(sendMessageSchema, async ({ conversationId, content }) => {
  const user = await requireUser();
  const participant = await requireParticipant(user.id, conversationId);

  if (participant.conversation.type === "PRIVATE") {
    const others = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: user.id } },
      select: { userId: true },
    });
    const otherIds = others.map((other) => other.userId);
    await assertNotBlocked(user.id, otherIds);
    // Former club mates can read their history but no longer write to each other.
    const membership = await findMembership(user.id);
    const stillTeammates =
      membership !== null &&
      (await prisma.clubMember.count({ where: { clubId: membership.clubId, userId: { in: otherIds } } })) ===
        otherIds.length;
    if (!stillTeammates) throw forbidden("Vous ne faites plus partie du même club que ce joueur");
  }
  await assertCanSendMessage(user.id);

  const now = new Date();
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { content, senderId: user.id, conversationId },
      include: messageInclude,
    }),
    prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: now } }),
    prisma.conversationParticipant.update({ where: { id: participant.id }, data: { lastReadAt: now } }),
  ]);

  const dto = toMessageDto(message);
  await emitToConversation(conversationId, "chat:message", dto);
  return { message: "Message envoyé", data: dto };
});

/** "me": hides the message for the caller only. "all": the sender erases it for everyone. */
export const deleteMessage = action(deleteMessageSchema, async ({ messageId, scope }) => {
  const user = await requireUser();
  const message = await prisma.message.findFirst({
    where: { id: messageId, conversation: { participants: { some: { userId: user.id } } } },
    select: { senderId: true, conversationId: true },
  });
  if (!message) throw notFound("Message introuvable");

  const payload = { conversationId: message.conversationId, messageId, forEveryone: scope === "all" };

  if (scope === "all") {
    if (message.senderId !== user.id) throw forbidden("Seul l'expéditeur peut supprimer pour tous");
    // The text is erased, not only hidden.
    await prisma.message.update({ where: { id: messageId }, data: { deletedForAll: true, content: "" } });
    await emitToConversation(message.conversationId, "chat:message_deleted", payload);
  } else {
    await prisma.messageDeletion.upsert({
      where: { messageId_userId: { messageId, userId: user.id } },
      create: { messageId, userId: user.id },
      update: {},
    });
    emitToUser(user.id, "chat:message_deleted", payload);
  }

  return { message: "Message supprimé" };
});

/** Marks the messages of others as read and tells their senders (read receipts). */
export const markConversationRead = action(conversationIdSchema, async (conversationId) => {
  const user = await requireUser();
  const participant = await requireParticipant(user.id, conversationId);

  const readAt = new Date();
  const [{ count }] = await prisma.$transaction([
    prisma.message.updateMany({
      where: { conversationId, senderId: { not: user.id }, read: false },
      data: { read: true, readAt },
    }),
    prisma.conversationParticipant.update({ where: { id: participant.id }, data: { lastReadAt: readAt } }),
  ]);

  if (count > 0) {
    await emitToConversation(conversationId, "chat:read", {
      conversationId,
      userId: user.id,
      readAt: readAt.toISOString(),
    });
  }
  return { message: "Conversation lue" };
});
