import { prisma } from "@/prisma";
import type { Membership } from "@/lib/auth/session";
import { isClubAdmin, sectionDisplayName } from "@/features/clubs/rules";

/** Join requests sent by a user, newest first (each one targets a section of a club). */
export async function getMyJoinRequests(userId: string) {
  const requests = await prisma.joinRequest.findMany({
    where: { userId },
    include: {
      team: { select: { id: true, name: true, level: true, club: { select: { name: true, logoUrl: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return requests.map(({ team, ...request }) => ({
    ...request,
    team: { id: team.id, name: sectionDisplayName(team.club.name, team.name), logoUrl: team.club.logoUrl, level: team.level },
  }));
}

/**
 * Join requests the caller reviews (pending first): every section of the club for the OWNER / ADMIN,
 * the sections they coach otherwise.
 */
export function getManagedJoinRequests(membership: Membership) {
  const coached = membership.sections.filter((section) => section.role === "COACH").map((section) => section.teamId);
  return prisma.joinRequest.findMany({
    where: {
      team: { clubId: membership.clubId },
      ...(isClubAdmin(membership.clubRole) ? {} : { teamId: { in: coached } }),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      team: { select: { id: true, name: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}
