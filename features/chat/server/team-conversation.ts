import { prisma } from "@/prisma";
import { notFound } from "@/lib/errors";
import type { ClubRole, ParticipantRole, TeamRole } from "@/generated/prisma/client";
import { emitToConversation, emitToUsers, leaveConversationRoom } from "@/server/realtime/emitter";
import { sectionDisplayName } from "@/features/clubs/rules";
import { nextGroupAdmin } from "../group-rules";

/**
 * Channels: every section (Team) has exactly one TEAM conversation whose participants mirror
 * the section members (coaches are ADMIN), and every club has one CLUB conversation with every
 * club member (OWNER / ADMIN are ADMIN). Members can't leave them, rename them or edit their
 * members: call these from the club / section actions (see features/team/server/team-chat.ts).
 * Deleting a section or a club removes its channel through the DB cascade.
 */

const roleFor = (teamRole: TeamRole): ParticipantRole => (teamRole === "COACH" ? "ADMIN" : "MEMBER");
const clubRoleFor = (clubRole: ClubRole): ParticipantRole => (clubRole === "MEMBER" ? "MEMBER" : "ADMIN");

/** Tells users a conversation disappeared for them and drops their sockets from its room. */
export function notifyConversationRemoved(conversationId: string, userIds: string[]) {
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
    select: { name: true, club: { select: { name: true } }, members: { select: { userId: true, role: true } } },
  });
  if (!team) throw notFound("Section introuvable");

  const conversation = await upsertTeamConversation(teamId, sectionDisplayName(team.club.name, team.name));
  const wanted = new Map(team.members.map((member) => [member.userId, roleFor(member.role)]));
  return syncParticipants(conversation, wanted);
}

/** Makes the participants of a channel match `wanted` (userId -> role). */
async function syncParticipants(
  conversation: { id: string; participants: { userId: string; role: ParticipantRole }[] },
  wanted: Map<string, ParticipantRole>,
) {
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

  notifyConversationRemoved(conversation.id, toRemove);
  emitToUsers([...wanted.keys()], "chat:conversation_updated", { conversationId: conversation.id });
  return conversation.id;
}

async function upsertClubConversation(clubId: string, name: string) {
  const upsert = () =>
    prisma.conversation.upsert({
      where: { clubId },
      create: { type: "CLUB", clubId, name },
      update: { name },
      select: { id: true, participants: { select: { userId: true, role: true } } },
    });
  try {
    return await upsert();
  } catch {
    return upsert(); // concurrent first calls (unique clubId)
  }
}

/** Creates the club channel if needed and syncs its name and participants with the club members. */
export async function ensureClubConversation(clubId: string): Promise<string> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { name: true, members: { select: { userId: true, role: true } } },
  });
  if (!club) throw notFound("Club introuvable");

  const conversation = await upsertClubConversation(clubId, club.name);
  return syncParticipants(conversation, new Map(club.members.map((m) => [m.userId, clubRoleFor(m.role)])));
}

/** Lazy backfill of the club channel (same idea as `ensureTeamChannelMembership`). */
export async function ensureClubChannelMembership(userId: string, clubId: string) {
  const participant = await prisma.conversationParticipant.findFirst({
    where: { userId, conversation: { clubId } },
    select: { id: true },
  });
  if (!participant) await ensureClubConversation(clubId);
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
  notifyConversationRemoved(conversation.id, [userId]);
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

/**
 * A former club member leaves the club's custom groups too (groups are created between members of
 * the club): every GROUP they are in that still has a current member of the club. An admin hands
 * over to the longest-standing member. Private conversations stay readable, but sending requires
 * a shared club again (see sendMessage).
 */
export async function removeFormerMemberFromClubGroups(clubId: string, userId: string): Promise<void> {
  const groups = await prisma.conversation.findMany({
    where: {
      type: "GROUP",
      participants: { some: { userId } },
      AND: [{ participants: { some: { userId: { not: userId }, user: { clubMembership: { clubId } } } } }],
    },
    select: { id: true, participants: { select: { userId: true, role: true, joinedAt: true } } },
  });

  for (const group of groups) {
    const newAdmin = nextGroupAdmin(group.participants, userId);
    await prisma.$transaction([
      prisma.conversationParticipant.deleteMany({ where: { conversationId: group.id, userId } }),
      ...(newAdmin
        ? [
            prisma.conversationParticipant.update({
              where: { userId_conversationId: { userId: newAdmin, conversationId: group.id } },
              data: { role: "ADMIN" as const },
            }),
          ]
        : []),
    ]);
    notifyConversationRemoved(group.id, [userId]);
    await emitToConversation(group.id, "chat:conversation_updated", { conversationId: group.id });
  }
}
