import { prisma } from "@/prisma";
import { notFound } from "@/lib/errors";
import type { ParticipantRole, TeamRole } from "@/generated/prisma/client";
import { emitToConversation, emitToUsers, leaveConversationRoom } from "@/server/realtime/emitter";

/**
 * Team channels: every team has exactly one TEAM conversation whose participants mirror
 * the team members (the coach is ADMIN). Members can't leave it, rename it or edit its
 * members: call these from the team actions (create team, join, leave, kick, accept join
 * request, role change). Deleting a team removes its channel through the DB cascade.
 */

const roleFor = (teamRole: TeamRole): ParticipantRole => (teamRole === "COACH" ? "ADMIN" : "MEMBER");

/** Notifies a user that a conversation disappeared for them and drops their sockets from its room. */
function revokeAccess(userIds: string[], conversationId: string) {
  if (userIds.length === 0) return;
  emitToUsers(userIds, "chat:conversation_removed", { conversationId });
  leaveConversationRoom(userIds, conversationId);
}

async function upsertTeamConversation(teamId: string, name: string) {
  const upsert = () =>
    prisma.conversation.upsert({
      where: { teamId },
      create: { type: "TEAM", teamId, name },
      update: { name },
      select: { id: true, participants: { select: { userId: true, role: true } } },
    });
  try {
    return await upsert();
  } catch {
    // Two concurrent first calls can both try to create (unique teamId): the second retry updates.
    return upsert();
  }
}

/**
 * Creates the team channel if needed and syncs its name and participants with the team.
 * Idempotent: safe to call whenever the team changes. Returns the conversation id.
 */
export async function ensureTeamConversation(teamId: string): Promise<string> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { name: true, members: { select: { userId: true, role: true } } },
  });
  if (!team) throw notFound("Club introuvable");

  const conversation = await upsertTeamConversation(teamId, team.name);
  const wanted = new Map(team.members.map((member) => [member.userId, roleFor(member.role)]));
  const current = new Map(conversation.participants.map((p) => [p.userId, p.role]));

  const toAdd = [...wanted].filter(([userId]) => !current.has(userId));
  const toRemove = [...current.keys()].filter((userId) => !wanted.has(userId));
  const toUpdate = [...wanted].filter(([userId, role]) => current.has(userId) && current.get(userId) !== role);

  await prisma.$transaction([
    prisma.conversationParticipant.createMany({
      data: toAdd.map(([userId, role]) => ({ conversationId: conversation.id, userId, role })),
      skipDuplicates: true,
    }),
    prisma.conversationParticipant.deleteMany({
      where: { conversationId: conversation.id, userId: { in: toRemove } },
    }),
    ...toUpdate.map(([userId, role]) =>
      prisma.conversationParticipant.update({
        where: { userId_conversationId: { userId, conversationId: conversation.id } },
        data: { role },
      }),
    ),
  ]);

  revokeAccess(toRemove, conversation.id);
  emitToUsers([...wanted.keys()], "chat:conversation_updated", { conversationId: conversation.id });
  return conversation.id;
}

/** Adds a new team member to the team channel (creates the channel if the team has none yet). */
export async function addTeamConversationMember(teamId: string, userId: string): Promise<void> {
  const [conversation, membership] = await Promise.all([
    prisma.conversation.findUnique({ where: { teamId }, select: { id: true } }),
    prisma.teamMember.findUnique({ where: { userId_teamId: { userId, teamId } }, select: { role: true } }),
  ]);
  if (!conversation || !membership) {
    await ensureTeamConversation(teamId);
    return;
  }

  const role = roleFor(membership.role);
  await prisma.conversationParticipant.upsert({
    where: { userId_conversationId: { userId, conversationId: conversation.id } },
    create: { userId, conversationId: conversation.id, role },
    update: { role },
  });
  await emitToConversation(conversation.id, "chat:conversation_updated", { conversationId: conversation.id });
}

/** Removes a former team member from the team channel. */
export async function removeTeamConversationMember(teamId: string, userId: string): Promise<void> {
  const conversation = await prisma.conversation.findUnique({ where: { teamId }, select: { id: true } });
  if (!conversation) return;

  await prisma.conversationParticipant.deleteMany({ where: { conversationId: conversation.id, userId } });
  revokeAccess([userId], conversation.id);
  await emitToConversation(conversation.id, "chat:conversation_updated", { conversationId: conversation.id });
}

/**
 * Lazy backfill for teams created before team channels existed: called when a member lists
 * their conversations. One indexed lookup when everything is already in place.
 */
export async function ensureTeamChannelMembership(userId: string, teamId: string) {
  const participant = await prisma.conversationParticipant.findFirst({
    where: { userId, conversation: { teamId } },
    select: { id: true },
  });
  if (!participant) await ensureTeamConversation(teamId);
}
