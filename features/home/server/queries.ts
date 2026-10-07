import { prisma } from "@/prisma";
import { findMembership } from "@/lib/auth/session";
import { canManageSection, isClubAdmin, sectionDisplayName } from "@/features/clubs/rules";
import { CALL_UP_RULES } from "@/features/call-ups/server/rules";
import { sectionEventsWhere } from "@/features/events/server/queries";

const LEADERBOARD_SIZE = 5;

/**
 * Everything the home dashboard needs, in one round of parallel queries.
 * Returns null when the user has no team (the home then shows the "no club" screen).
 */
export async function getHomeData(userId: string) {
  const membership = await findMembership(userId);
  if (!membership) return null;

  const { team, role, club } = membership;
  const isCoach = role === "COACH";
  const canManage = canManageSection(membership, team.id);
  const teamEvent = { event: { teamId: team.id } };

  const [members, recentResults, upcomingMatches, resultCounts, playerTotals, topScorers, topAssists] =
    await Promise.all([
      prisma.teamMember.findMany({
        where: { teamId: team.id },
        select: { userId: true, position: true, user: { select: { name: true, image: true } } },
      }),
      prisma.event.findMany({
        where: { teamId: team.id, teamStat: { isNot: null } },
        select: {
          id: true,
          startDate: true,
          teamStat: { select: { result: true, opponent: true, goalsFor: true, goalsAgainst: true } },
          playerStats: { where: { userId }, select: { rating: true } },
        },
        orderBy: { startDate: "desc" },
        take: 5,
      }),
      prisma.event.findMany({
        where: { ...sectionEventsWhere(membership), startDate: { gte: new Date() }, type: { in: ["LEAGUE", "CUP"] } },
        select: { id: true, type: true, startDate: true, location: true, opponent: true },
        orderBy: { startDate: "asc" },
        take: 3,
      }),
      prisma.teamStat.groupBy({ by: ["result"], where: { teamId: team.id }, _count: { _all: true } }),
      prisma.playerStat.aggregate({
        where: { userId, ...teamEvent },
        _count: { _all: true },
        _sum: { goals: true, assists: true, minutesPlayed: true },
        _avg: { rating: true },
      }),
      prisma.playerStat.groupBy({
        by: ["userId"],
        where: teamEvent,
        _sum: { goals: true },
        orderBy: { _sum: { goals: "desc" } },
        take: LEADERBOARD_SIZE,
      }),
      prisma.playerStat.groupBy({
        by: ["userId"],
        where: teamEvent,
        _sum: { assists: true },
        orderBy: { _sum: { assists: "desc" } },
        take: LEADERBOARD_SIZE,
      }),
    ]);

  const withPlayer = (entries: { userId: string; value: number | null }[]) =>
    entries
      .filter((entry) => (entry.value ?? 0) > 0)
      .map((entry) => {
        const member = members.find((m) => m.userId === entry.userId);
        return {
          userId: entry.userId,
          name: member?.user.name ?? "Ancien joueur",
          image: member?.user.image ?? null,
          position: member?.position ?? null,
          value: entry.value ?? 0,
        };
      });

  const countOf = (result: "WIN" | "DRAW" | "LOSS") =>
    resultCounts.find((row) => row.result === result)?._count._all ?? 0;
  const wins = countOf("WIN");
  const draws = countOf("DRAW");
  const losses = countOf("LOSS");
  const matches = wins + draws + losses;

  const goals = playerTotals._sum.goals ?? 0;
  const assists = playerTotals._sum.assists ?? 0;

  return {
    role,
    team: {
      id: team.id,
      name: sectionDisplayName(club.name, team.name),
      level: team.level,
      logoUrl: club.logoUrl,
      memberCount: members.length,
      inviteCode: canManage ? team.inviteCode : null,
    },
    recentResults: recentResults.flatMap(({ teamStat, playerStats, ...event }) =>
      teamStat ? [{ ...event, ...teamStat, rating: playerStats[0]?.rating ?? null }] : [],
    ),
    upcomingMatches,
    teamStats: {
      matches,
      wins,
      draws,
      losses,
      points: wins * 3 + draws,
      winRate: matches ? Math.round((wins / matches) * 100) : 0,
    },
    playerStats: isCoach
      ? null
      : {
          matches: playerTotals._count._all,
          goals,
          assists,
          contributions: goals + assists,
          minutesPlayed: playerTotals._sum.minutesPlayed ?? 0,
          averageRating: playerTotals._avg.rating,
        },
    topScorers: withPlayer(topScorers.map((row) => ({ userId: row.userId, value: row._sum.goals }))),
    topAssists: withPlayer(topAssists.map((row) => ({ userId: row.userId, value: row._sum.assists }))),
  };
}

/**
 * Counters of the navigation badges (bottom tabs / sidebar), cheap counts only:
 * call-ups still waiting for the user's answer, join requests waiting for the user's review.
 */
export async function getNavBadges(userId: string) {
  const membership = await findMembership(userId);
  if (!membership) return { callUps: 0, joinRequests: 0 };

  const answerableAfter = new Date(Date.now() + CALL_UP_RULES.replyMinHours * 3_600_000);
  const coached = membership.sections.filter((section) => section.role === "COACH").map((section) => section.teamId);
  const reviewsAll = isClubAdmin(membership.clubRole);

  const [callUps, joinRequests] = await Promise.all([
    prisma.callUp.count({
      where: {
        userId,
        status: "PENDING",
        event: { startDate: { gt: answerableAfter }, teamId: { in: membership.sections.map((section) => section.teamId) } },
      },
    }),
    reviewsAll || coached.length > 0
      ? prisma.joinRequest.count({
          where: {
            status: "PENDING",
            team: { clubId: membership.clubId },
            ...(reviewsAll ? {} : { teamId: { in: coached } }),
          },
        })
      : 0,
  ]);
  return { callUps, joinRequests };
}
