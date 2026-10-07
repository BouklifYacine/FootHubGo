import { prisma } from "@/prisma";
import { notFound } from "@/lib/errors";
import type { MatchResult } from "@/generated/prisma/client";
import {
  buildStanding,
  compareStandings,
  getStatsWindow,
  summarizePlayerStats,
  summarizeTeamStats,
} from "../compute";

/** League table of every team (aggregated by the database) + last 5 results. */
export async function getLeaderboard() {
  const [teams, results, goals] = await Promise.all([
    prisma.team.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        teamStats: { select: { result: true }, orderBy: { createdAt: "desc" }, take: 5 },
      },
    }),
    prisma.teamStat.groupBy({ by: ["teamId", "result"], _count: { _all: true } }),
    prisma.teamStat.groupBy({ by: ["teamId"], _sum: { goalsFor: true, goalsAgainst: true } }),
  ]);

  const resultCounts = new Map<string, number>();
  for (const row of results) resultCounts.set(`${row.teamId}:${row.result}`, row._count._all);
  const goalSums = new Map(goals.map((row) => [row.teamId, row._sum]));
  const countOf = (teamId: string, result: MatchResult) => resultCounts.get(`${teamId}:${result}`) ?? 0;

  return teams
    .map(({ teamStats, ...team }) =>
      buildStanding(
        team,
        {
          wins: countOf(team.id, "WIN"),
          draws: countOf(team.id, "DRAW"),
          losses: countOf(team.id, "LOSS"),
          goalsFor: goalSums.get(team.id)?.goalsFor ?? 0,
          goalsAgainst: goalSums.get(team.id)?.goalsAgainst ?? 0,
        },
        teamStats.map((stat) => stat.result),
      ),
    )
    .sort(compareStandings);
}

export async function getTeamStatsSummary(teamId: string) {
  const matches = await prisma.teamStat.findMany({
    where: { teamId },
    select: { result: true, goalsFor: true, goalsAgainst: true, isHome: true },
  });
  return summarizeTeamStats(matches);
}

export async function getPlayerStatsSummary(userId: string) {
  const matches = await prisma.playerStat.findMany({
    where: { userId },
    select: { goals: true, assists: true, rating: true, minutesPlayed: true, isStarter: true },
  });
  return summarizePlayerStats(matches);
}

/**
 * Team + player stats of one event of `teamId`. The coach also gets the players
 * who can still receive stats (confirmed call-up, no stats yet).
 */
export async function getEventStats(eventId: string, teamId: string, isCoach: boolean) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId },
    select: {
      id: true,
      title: true,
      type: true,
      startDate: true,
      opponent: true,
      team: { select: { name: true, logoUrl: true } },
      teamStat: true,
      playerStats: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });
  if (!event) throw notFound("Événement introuvable");

  const eligiblePlayers = isCoach
    ? await prisma.teamMember.findMany({
        where: {
          teamId,
          role: "PLAYER",
          user: {
            callUps: { some: { eventId, status: "CONFIRMED" } },
            playerStats: { none: { eventId } },
          },
        },
        select: { userId: true, position: true, user: { select: { name: true } } },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  const { teamStat, playerStats, ...rest } = event;
  return { event: rest, teamStat, playerStats, eligiblePlayers, window: getStatsWindow(event.startDate) };
}
