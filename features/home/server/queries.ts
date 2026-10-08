import { prisma } from "@/prisma";
import { findMembership, type Membership } from "@/lib/auth/session";
import { canManageSection, isClubAdmin, sectionDisplayName } from "@/features/clubs/rules";
import { CALL_UP_RULES } from "@/features/call-ups/server/rules";
import { sectionEventsWhere } from "@/features/events/server/queries";
import { participationOf } from "@/features/events/server/participation";
import { STATS_OPEN_AFTER_HOURS } from "@/features/stats/compute";
import { MOTM_MIN_NOMINEES, motmOpenRange, motmWindow } from "@/features/motm/rules";
import { seatsLeft } from "@/features/carpool/rules";

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

  const [members, recentResults, resultCounts, playerTotals, topScorers, topAssists, nextSteps] =
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
      getNextSteps(membership, userId, canManage),
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
    canManage,
    ...nextSteps,
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

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/**
 * The top of the home page: the next event (with "who is coming" / my answer), the to-do list and,
 * for the people who manage the section, the first-run checklist.
 */
async function getNextSteps(membership: Membership, userId: string, canManage: boolean) {
  const now = new Date();
  const section = sectionEventsWhere(membership);
  const teamId = membership.teamId;
  const eventSelect = { id: true, title: true, type: true, startDate: true, location: true, opponent: true, teamId: true, isHome: true } as const;

  const voteRange = motmOpenRange(now);
  const [next, pendingCallUps, trainings, matchesToCallUp, matchesWithoutStats, joinRequests, checklistData, votes, awayMatches] = await Promise.all([
    // An event that started less than 2h ago is still "the next one" (match in progress).
    prisma.event.findFirst({
      where: { ...section, startDate: { gte: new Date(now.getTime() - 2 * HOUR) } },
      orderBy: { startDate: "asc" },
      select: eventSelect,
    }),
    prisma.callUp.findMany({
      where: { userId, status: "PENDING", event: { teamId, startDate: { gt: now } } },
      orderBy: { event: { startDate: "asc" } },
      take: 5,
      select: { id: true, event: { select: eventSelect } },
    }),
    membership.role === "PLAYER"
      ? prisma.event.findMany({
          where: {
            teamId,
            type: "TRAINING",
            startDate: { gt: now, lte: new Date(now.getTime() + 7 * DAY) },
            attendances: { none: { userId, status: { in: ["PRESENT", "ABSENT"] } } },
          },
          orderBy: { startDate: "asc" },
          take: 3,
          select: eventSelect,
        })
      : [],
    canManage
      ? prisma.event.findMany({
          where: {
            teamId,
            type: { in: ["LEAGUE", "CUP"] },
            startDate: { gt: new Date(now.getTime() + 24 * HOUR), lte: new Date(now.getTime() + 21 * DAY) },
            callUps: { none: {} },
          },
          orderBy: { startDate: "asc" },
          take: 3,
          select: eventSelect,
        })
      : [],
    canManage
      ? prisma.event.findMany({
          where: {
            teamId,
            type: { in: ["LEAGUE", "CUP"] },
            startDate: { gte: new Date(now.getTime() - 30 * DAY), lte: new Date(now.getTime() - STATS_OPEN_AFTER_HOURS * HOUR) },
            teamStat: null,
          },
          orderBy: { startDate: "desc" },
          take: 3,
          select: eventSelect,
        })
      : [],
    canManage ? prisma.joinRequest.count({ where: { teamId, status: "PENDING" } }) : 0,
    canManage ? getChecklist(membership, userId) : null,
    // Man-of-the-match votes waiting for the user (present at the match, or coach of the section).
    prisma.event.findMany({
      where: {
        teamId,
        type: { in: ["LEAGUE", "CUP"] },
        startDate: { gte: voteRange.from, lte: voteRange.to },
        motmVotes: { none: { voterId: userId } },
        ...(membership.role === "COACH" ? {} : { callUps: { some: { userId, status: "CONFIRMED" } } }),
      },
      orderBy: { startDate: "desc" },
      take: 3,
      select: { ...eventSelect, _count: { select: { callUps: { where: { status: "CONFIRMED" } } } } },
    }),
    // Carpool: upcoming away matches (7 days) the user is coming to, without a car or a seat yet.
    prisma.event.findMany({
      where: {
        teamId,
        type: { in: ["LEAGUE", "CUP"] },
        isHome: false,
        startDate: { gt: now, lte: new Date(now.getTime() + 7 * DAY) },
        callUps: { some: { userId, status: "CONFIRMED" } },
        rides: { none: { driverId: userId } },
        ridePassengers: { none: { userId } },
      },
      orderBy: { startDate: "asc" },
      take: 3,
      select: { ...eventSelect, rides: { select: { seats: true, _count: { select: { passengers: true } } } } },
    }),
  ]);

  const participation = next ? await participationOf([next], membership, userId, now) : null;
  return {
    nextEvent: next ? { ...next, isClubEvent: next.teamId === null, ...participation!.get(next.id)! } : null,
    todo: {
      callUpsToAnswer: pendingCallUps
        .filter((callUp) => callUp.event.id !== next?.id)
        .map((callUp) => ({ callUpId: callUp.id, ...callUp.event })),
      trainingsToAnswer: trainings.filter((event) => event.id !== next?.id),
      matchesToCallUp: matchesToCallUp.filter((event) => event.id !== next?.id),
      matchesWithoutStats,
      joinRequests,
      motmVotes: votes
        .filter((event) => event._count.callUps >= MOTM_MIN_NOMINEES)
        .map((event) => ({ ...event, _count: undefined, closesAt: motmWindow(event.startDate, now).closesAt })),
      carpools: awayMatches.map(({ rides, ...event }) => ({
        ...event,
        seatsLeft: rides.reduce((total, ride) => total + seatsLeft({ seats: ride.seats, booked: ride._count.passengers }), 0),
      })),
    },
    checklist: checklistData,
  };
}

/** First steps of a section's manager, derived from the data (no table): hidden once done or dismissed. */
async function getChecklist(membership: Membership, userId: string) {
  const teamId = membership.teamId;
  const [user, memberCount, eventCount, callUpCount, messageCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { onboardingSeen: true } }),
    prisma.teamMember.count({ where: { teamId } }),
    prisma.event.count({ where: { teamId } }),
    prisma.callUp.count({ where: { event: { teamId } } }),
    prisma.message.count({ where: { conversation: { teamId } } }),
  ]);
  return {
    dismissed: user?.onboardingSeen.includes(COACH_CHECKLIST_KEY) ?? false,
    inviteCode: membership.team.inviteCode,
    sectionName: membership.team.name,
    steps: {
      invitePlayers: memberCount > 1,
      createEvent: eventCount > 0,
      sendCallUps: callUpCount > 0,
      sayHello: messageCount > 0,
    },
  };
}

/** `User.onboardingSeen` key of the dismissed coach checklist. */
export const COACH_CHECKLIST_KEY = "coach-checklist";

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
