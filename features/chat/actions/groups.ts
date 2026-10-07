"use server";

import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireMember, requireUser } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { emitToConversation, emitToUser, leaveConversationRoom } from "@/server/realtime/emitter";
import {
  addGroupMembersSchema,
  GROUP_MAX_MEMBERS,
  removeGroupMemberSchema,
  renameGroupSchema,
} from "../schemas";
import { assertNotBlocked, assertTeammates, requireGroupAdmin, requireParticipant } from "../server/access";

// Custom groups only: team channels follow the team (see server/team-conversation.ts).

const notifyUpdated = (conversationId: string) =>
  emitToConversation(conversationId, "chat:conversation_updated", { conversationId });

export const renameGroup = action(renameGroupSchema, async ({ conversationId, name }) => {
  const user = await requireUser();
  await requireGroupAdmin(user.id, conversationId);
  await prisma.conversation.update({ where: { id: conversationId }, data: { name } });
  await notifyUpdated(conversationId);
  return { message: "Groupe renommé" };
});

export const addGroupMembers = action(addGroupMembersSchema, async ({ conversationId, userIds }) => {
  const { user, membership } = await requireMember();
  await requireGroupAdmin(user.id, conversationId);

  const existing = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  const existingIds = new Set(existing.map((p) => p.userId));
  const newIds = [...new Set(userIds)].filter((id) => !existingIds.has(id));
  if (newIds.length === 0) throw new AppError("Ces membres sont déjà dans le groupe");
  if (existingIds.size + newIds.length > GROUP_MAX_MEMBERS) {
    throw new AppError(`Un groupe ne peut pas dépasser ${GROUP_MAX_MEMBERS} membres`);
  }

  await assertTeammates(membership.clubId, newIds);
  await assertNotBlocked(user.id, newIds);
  await prisma.conversationParticipant.createMany({
    data: newIds.map((userId) => ({ userId, conversationId, role: "MEMBER" as const })),
    skipDuplicates: true,
  });

  await notifyUpdated(conversationId);
  return { message: newIds.length > 1 ? "Membres ajoutés" : "Membre ajouté" };
});

/** Kick (admin, another member) or leave (yourself; the admin deletes the group instead). */
export const removeGroupMember = action(removeGroupMemberSchema, async ({ conversationId, userId: targetId }) => {
  const user = await requireUser();
  const me = await requireParticipant(user.id, conversationId);
  if (me.conversation.type !== "GROUP") throw new AppError("Action réservée aux groupes");

  const isSelf = targetId === user.id;
  if (isSelf && me.role === "ADMIN") {
    throw new AppError("L'administrateur ne peut pas quitter le groupe. Supprimez-le à la place.");
  }
  if (!isSelf && me.role !== "ADMIN") throw forbidden("Seul l'administrateur peut retirer des membres");

  const { count } = await prisma.conversationParticipant.deleteMany({
    where: { conversationId, userId: targetId },
  });
  if (count === 0) throw notFound("Ce membre n'est pas dans le groupe");

  emitToUser(targetId, "chat:conversation_removed", { conversationId });
  leaveConversationRoom([targetId], conversationId);
  await notifyUpdated(conversationId);
  return { message: isSelf ? "Vous avez quitté le groupe" : "Membre retiré" };
});
