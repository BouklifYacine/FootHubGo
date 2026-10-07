import { prisma } from "@/prisma";
import {
  addTeamConversationMember,
  ensureTeamConversation,
  notifyConversationRemoved,
  removeTeamConversationMember,
} from "@/features/chat/server/team-conversation";

/**
 * Keeps the team chat channel in sync with the team members.
 * A chat failure must never break a team action, so errors are only logged.
 */
async function safely(label: string, run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    console.error(`[team-chat] ${label}`, error);
  }
}

export function syncChatOnTeamCreated(teamId: string, coachId: string) {
  return safely("team created", async () => {
    await ensureTeamConversation(teamId);
    await addTeamConversationMember(teamId, coachId);
  });
}

export function syncChatOnMemberJoined(teamId: string, userId: string) {
  return safely("member joined", () => addTeamConversationMember(teamId, userId));
}

export function syncChatOnMemberLeft(teamId: string, userId: string) {
  return safely("member left", () => removeTeamConversationMember(teamId, userId));
}

/** Re-syncs the channel name and roles (a coach is ADMIN of the channel, a player MEMBER). */
export function resyncTeamChat(teamId: string) {
  return safely("resync", () => ensureTeamConversation(teamId));
}

/**
 * Deletes a team. Its channel goes with it through the DB cascade, so the participants
 * are read first to tell their open tabs that the conversation is gone.
 */
export async function deleteTeamWithChat(teamId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { teamId },
    select: { id: true, participants: { select: { userId: true } } },
  });
  const team = await prisma.team.delete({ where: { id: teamId } });

  if (conversation) {
    await safely("team deleted", async () =>
      notifyConversationRemoved(
        conversation.id,
        conversation.participants.map((participant) => participant.userId),
      ),
    );
  }
  return team;
}
