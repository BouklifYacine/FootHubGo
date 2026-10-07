import {
  addTeamConversationMember,
  ensureTeamConversation,
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
