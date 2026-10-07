import { prisma } from "@/prisma";
import {
  addTeamConversationMember,
  ensureClubConversation,
  ensureTeamConversation,
  notifyConversationRemoved,
  removeFormerMemberFromClubGroups,
  removeTeamConversationMember,
} from "@/features/chat/server/team-conversation";

/**
 * Keeps the chat channels in sync with the club: one CLUB channel (every club member) and one
 * TEAM channel per section (its members). A chat failure must never break a club action, so
 * errors are only logged.
 */
async function safely(label: string, run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    console.error(`[club-chat] ${label}`, error);
  }
}

/** Club channel + every section channel: names, participants and roles. Idempotent. */
export function resyncClubChat(clubId: string) {
  return safely("resync club", async () => {
    await ensureClubConversation(clubId);
    const sections = await prisma.team.findMany({ where: { clubId }, select: { id: true } });
    for (const section of sections) await ensureTeamConversation(section.id);
  });
}

/** Re-syncs one section channel (name, coaches = channel ADMIN, players = MEMBER). */
export function resyncSectionChat(teamId: string) {
  return safely("resync section", () => ensureTeamConversation(teamId));
}

/** A user joined a section (and maybe the club). */
export function syncChatOnMemberJoined(clubId: string, teamId: string, userId: string) {
  return safely("member joined", async () => {
    await addTeamConversationMember(teamId, userId);
    await ensureClubConversation(clubId);
  });
}

/** A user left one section but stays in the club. */
export function syncChatOnSectionLeft(teamId: string, userId: string) {
  return safely("section left", () => removeTeamConversationMember(teamId, userId));
}

/** A user left the club: every section channel, the club channel and the club's groups. */
export function syncChatOnClubLeft(clubId: string, teamIds: string[], userId: string) {
  return safely("club left", async () => {
    for (const teamId of teamIds) await removeTeamConversationMember(teamId, userId);
    await ensureClubConversation(clubId);
    await removeFormerMemberFromClubGroups(clubId, userId);
  });
}

/** Participants of channels about to disappear through the DB cascade (to tell their open tabs). */
async function channelParticipants(where: { clubId: string } | { teamId: string }) {
  const filter =
    "clubId" in where ? { OR: [{ clubId: where.clubId }, { team: { clubId: where.clubId } }] } : { teamId: where.teamId };
  return prisma.conversation.findMany({
    where: filter,
    select: { id: true, participants: { select: { userId: true } } },
  });
}

async function notifyRemoved(conversations: Awaited<ReturnType<typeof channelParticipants>>) {
  await safely("channels removed", async () => {
    for (const conversation of conversations) {
      notifyConversationRemoved(
        conversation.id,
        conversation.participants.map((participant) => participant.userId),
      );
    }
  });
}

/** Deletes a club: sections, members, events, stats, channels... go through the DB cascade. */
export async function deleteClubWithChat(clubId: string) {
  const conversations = await channelParticipants({ clubId });
  const club = await prisma.club.delete({ where: { id: clubId } });
  await notifyRemoved(conversations);
  return club;
}

/** Deletes an (empty) section and its channel. */
export async function deleteSectionWithChat(teamId: string) {
  const conversations = await channelParticipants({ teamId });
  const section = await prisma.team.delete({ where: { id: teamId } });
  await notifyRemoved(conversations);
  return section;
}
