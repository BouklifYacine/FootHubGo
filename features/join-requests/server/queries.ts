import { prisma } from "@/prisma";

/** Join requests sent by a user, newest first. */
export function getMyJoinRequests(userId: string) {
  return prisma.joinRequest.findMany({
    where: { userId },
    include: { team: { select: { id: true, name: true, logoUrl: true, level: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Join requests received by a team (pending first). */
export function getTeamJoinRequests(teamId: string) {
  return prisma.joinRequest.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}
