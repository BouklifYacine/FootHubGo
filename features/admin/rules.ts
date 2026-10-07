type Member = { userId: string; role: string };

/** True when deleting `userIds` leaves the team with members but no coach (pure, tested). */
export function leavesTeamWithoutCoach(members: Member[], userIds: string[]) {
  const remaining = members.filter((member) => !userIds.includes(member.userId));
  return remaining.length > 0 && !remaining.some((member) => member.role === "COACH");
}
