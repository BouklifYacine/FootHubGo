import { prisma } from "@/prisma";

const injurySelect = { id: true, type: true, description: true, startDate: true, endDate: true } as const;

/** Injury history of a player, newest first (optionally limited to one team). */
export function getPlayerInjuries(userId: string, teamId?: string) {
  return prisma.injury.findMany({
    where: { userId, ...(teamId && { teamId }) },
    orderBy: { startDate: "desc" },
    select: injurySelect,
  });
}

/** Every player of the team with their current injury (if any) and injury count. */
export async function getTeamInjuries(teamId: string) {
  const now = new Date();
  const members = await prisma.teamMember.findMany({
    where: { teamId, role: "PLAYER" },
    orderBy: { user: { name: "asc" } },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          injuries: { where: { teamId }, orderBy: { startDate: "desc" }, select: injurySelect },
        },
      },
    },
  });

  return members.map(({ user: { injuries, ...player } }) => ({
    ...player,
    activeInjury: injuries.find((injury) => injury.startDate <= now && injury.endDate >= now) ?? null,
    totalInjuries: injuries.length,
  }));
}
