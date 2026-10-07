import { prisma } from "@/prisma";
import { findMembership } from "@/lib/auth/session";

/** The current user's team, its members (with active injuries) and the user's role. */
export async function getMyTeam(userId: string) {
  const membership = await findMembership(userId);
  if (!membership) return { team: null, members: [], role: "NO_CLUB" as const };

  const isCoach = membership.role === "COACH";
  const members = await prisma.teamMember.findMany({
    where: { teamId: membership.teamId },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          // Emails are only visible to the coach
          email: isCoach,
          injuries: {
            where: { teamId: membership.teamId, endDate: { gte: new Date() } },
            select: { id: true, type: true, startDate: true, endDate: true, description: true },
          },
        },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  // The invite code is only visible to the coach
  const team = { ...membership.team, inviteCode: isCoach ? membership.team.inviteCode : null };

  return {
    team,
    members: members.map((member) => ({ ...member, isInjured: member.user.injuries.length > 0 })),
    role: membership.role,
  };
}

/** Teams listed in the directory: public fields only (never the invite code), private teams hidden. */
export function getPublicTeams() {
  return prisma.team.findMany({
    where: { visibility: { not: "PRIVATE" } },
    select: {
      id: true,
      name: true,
      description: true,
      logoUrl: true,
      level: true,
      visibility: true,
      _count: { select: { members: true } },
    },
    orderBy: { name: "asc" },
  });
}
