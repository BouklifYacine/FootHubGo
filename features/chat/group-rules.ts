import type { ParticipantRole } from "@/generated/prisma/browser";

type Participant = { userId: string; role: ParticipantRole; joinedAt: Date };

/**
 * Who becomes admin of a group when `leavingUserId` is removed (pure, tested):
 * nobody if another admin stays (or nobody stays), else the longest-standing remaining member.
 */
export function nextGroupAdmin(participants: Participant[], leavingUserId: string): string | null {
  const leaving = participants.find((p) => p.userId === leavingUserId);
  const remaining = participants.filter((p) => p.userId !== leavingUserId);
  if (leaving?.role !== "ADMIN" || remaining.some((p) => p.role === "ADMIN")) return null;
  const oldest = [...remaining].sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())[0];
  return oldest?.userId ?? null;
}
