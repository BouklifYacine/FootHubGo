import { prisma } from "@/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { notFound } from "@/lib/errors";
import {
  MOTM_MIN_NOMINEES,
  hasMotm,
  isMotmVoter,
  motmAwardsByUser,
  motmClosedBefore,
  motmWindow,
  motmWinners,
  type MotmTally,
} from "../rules";

/** Votes per (match, nominee), as tallies for the pure rules. */
export async function getMotmTallies(where: Prisma.MotmVoteWhereInput): Promise<MotmTally[]> {
  const rows = await prisma.motmVote.groupBy({ by: ["eventId", "nomineeId"], where, _count: { _all: true } });
  return rows.map((row) => ({ eventId: row.eventId, nomineeId: row.nomineeId, votes: row._count._all }));
}

/** Man-of-the-match awards of the matches of a section whose vote is closed, per player. */
export async function getSectionMotmAwards(teamId: string, now = new Date()) {
  return motmAwardsByUser(await getMotmTallies({ event: { teamId, startDate: { lt: motmClosedBefore(now) } } }));
}

/** How many times a user was man of the match (closed votes, any section). */
export async function countMotmAwards(userId: string, now = new Date()) {
  const closed = { startDate: { lt: motmClosedBefore(now) } };
  const events = await prisma.motmVote.findMany({
    where: { nomineeId: userId, event: closed },
    distinct: ["eventId"],
    select: { eventId: true },
  });
  if (events.length === 0) return 0;
  const awards = motmAwardsByUser(await getMotmTallies({ eventId: { in: events.map((event) => event.eventId) } }));
  return awards.get(userId) ?? 0;
}

/** Present players of a match: PLAYERs of the section with a confirmed call-up (the nominees). */
export const presentPlayersWhere = (teamId: string, eventId: string): Prisma.TeamMemberWhereInput => ({
  teamId,
  role: "PLAYER",
  user: { callUps: { some: { eventId, status: "CONFIRMED" } } },
});

/**
 * The man-of-the-match block of a match of the caller's active section: window, the caller's vote,
 * the turnout and, once closed only, the results. null when the event has no vote (training,
 * club-wide event, fewer than 2 present players).
 */
export async function getEventMotm(eventId: string, teamId: string, viewer: { userId: string; role: "COACH" | "PLAYER" | "NO_CLUB" }) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId },
    select: { id: true, type: true, teamId: true, startDate: true },
  });
  if (!event) throw notFound("Événement introuvable");
  if (!hasMotm(event) || event.startDate > new Date()) return null;

  const [nominees, coachCount, myCallUp, myVote, voteCount] = await Promise.all([
    prisma.teamMember.findMany({
      where: presentPlayersWhere(teamId, event.id),
      select: { userId: true, user: { select: { name: true, image: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.teamMember.count({ where: { teamId, role: "COACH" } }),
    prisma.callUp.findUnique({ where: { userId_eventId: { userId: viewer.userId, eventId: event.id } }, select: { status: true } }),
    prisma.motmVote.findUnique({ where: { eventId_voterId: { eventId: event.id, voterId: viewer.userId } }, select: { nomineeId: true } }),
    prisma.motmVote.count({ where: { eventId: event.id } }),
  ]);
  if (nominees.length < MOTM_MIN_NOMINEES) return null;

  const window = motmWindow(event.startDate);
  const isVoter = isMotmVoter({
    sectionRole: viewer.role === "NO_CLUB" ? null : viewer.role,
    callUpStatus: myCallUp?.status ?? null,
  });
  const players = nominees.map((nominee) => ({ userId: nominee.userId, name: nominee.user.name, image: nominee.user.image }));

  let results = null;
  if (window.state === "closed") {
    const tallies = await getMotmTallies({ eventId: event.id });
    const { winnerIds, votes } = motmWinners(tallies);
    const votesOf = (userId: string) => tallies.find((tally) => tally.nomineeId === userId)?.votes ?? 0;
    results = {
      votes,
      winners: players.filter((player) => winnerIds.includes(player.userId)),
      podium: players
        .map((player) => ({ ...player, votes: votesOf(player.userId) }))
        .filter((player) => player.votes > 0)
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 3),
    };
  }

  return {
    state: window.state,
    opensAt: window.opensAt,
    closesAt: window.closesAt,
    isVoter,
    canVote: isVoter && window.state === "open",
    myVote: myVote?.nomineeId ?? null,
    nominees: players.filter((player) => player.userId !== viewer.userId),
    turnout: { votes: voteCount, voters: nominees.length + coachCount },
    results,
  };
}
