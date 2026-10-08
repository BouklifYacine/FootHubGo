import { prisma } from "@/prisma";
import type { Membership } from "@/lib/auth/session";
import { canManageSection } from "@/features/clubs/rules";
import { callUpAnswerState, sendCallUpError } from "@/features/call-ups/server/rules";
import { MOTM_MIN_NOMINEES, hasMotm, isMotmVoter, motmWindow } from "@/features/motm/rules";

type EventRef = { id: string; type: "TRAINING" | "LEAGUE" | "CUP"; startDate: Date; teamId: string | null };

/**
 * "Who is coming?" for a set of events, from the caller's point of view (home, agenda, event page):
 * - `myCallUp`: the caller's call-up to a match, whether they can still answer / change it, and until when;
 * - `myAttendance`: the caller's answer for a training of their section (players);
 * - `callUps`: answers summary of a match, for the people who manage its section (+ can they still send);
 * - `attendance`: present / absent counts of a training, for the people who manage its section;
 * - `motmVote`: the man-of-the-match vote of a match the caller can vote for right now (and whether they did).
 */
export async function participationOf(events: EventRef[], membership: Membership, userId: string, now = new Date()) {
  const ids = events.map((event) => event.id);
  const sectionIds = membership.sections.map((section) => section.teamId);
  const managedIds = events
    .filter((event) => event.teamId !== null && canManageSection(membership, event.teamId))
    .map((event) => event.id);

  const roleIn = (teamId: string | null) => membership.sections.find((section) => section.teamId === teamId)?.role ?? null;
  const votingIds = events
    .filter((event) => hasMotm(event) && motmWindow(event.startDate, now).state === "open")
    .map((event) => event.id);

  const [myCallUps, myAttendances, callUpCounts, attendanceCounts, playerCounts, myVotes, presentCounts] = await Promise.all([
    prisma.callUp.findMany({
      where: { userId, eventId: { in: ids } },
      select: { id: true, eventId: true, status: true, respondedAt: true },
    }),
    prisma.attendance.findMany({ where: { userId, eventId: { in: ids } }, select: { eventId: true, status: true } }),
    managedIds.length
      ? prisma.callUp.groupBy({ by: ["eventId", "status"], where: { eventId: { in: managedIds } }, _count: { _all: true } })
      : [],
    managedIds.length
      ? prisma.attendance.groupBy({ by: ["eventId", "status"], where: { eventId: { in: managedIds } }, _count: { _all: true } })
      : [],
    managedIds.length
      ? prisma.teamMember.groupBy({
          by: ["teamId"],
          where: { teamId: { in: sectionIds }, role: "PLAYER" },
          _count: { _all: true },
        })
      : [],
    votingIds.length
      ? prisma.motmVote.findMany({ where: { voterId: userId, eventId: { in: votingIds } }, select: { eventId: true } })
      : [],
    votingIds.length
      ? prisma.callUp.groupBy({
          by: ["eventId"],
          where: { eventId: { in: votingIds }, status: "CONFIRMED", user: { memberships: { some: { role: "PLAYER" } } } },
          _count: { _all: true },
        })
      : [],
  ]);

  const count = (rows: { eventId: string; status: string; _count: { _all: number } }[], eventId: string, status: string) =>
    rows.find((row) => row.eventId === eventId && row.status === status)?._count._all ?? 0;

  return new Map(
    events.map((event) => {
      const callUp = myCallUps.find((row) => row.eventId === event.id);
      const isManaged = managedIds.includes(event.id);
      const isMatch = event.type !== "TRAINING";
      const isOwnSectionTraining =
        !isMatch && event.teamId !== null && event.teamId === membership.teamId && membership.role === "PLAYER";
      const players = playerCounts.find((row) => row.teamId === event.teamId)?._count._all ?? 0;
      const sectionRole = roleIn(event.teamId);
      const canVote =
        votingIds.includes(event.id) &&
        (presentCounts.find((row) => row.eventId === event.id)?._count._all ?? 0) >= MOTM_MIN_NOMINEES &&
        isMotmVoter({ sectionRole: sectionRole === "NO_CLUB" ? null : sectionRole, callUpStatus: callUp?.status ?? null });

      return [
        event.id,
        {
          myCallUp: callUp
            ? {
                id: callUp.id,
                status: callUp.status,
                respondedAt: callUp.respondedAt,
                ...callUpAnswerState(callUp.status, event.startDate, now),
              }
            : null,
          myAttendance: isOwnSectionTraining
            ? {
                status: myAttendances.find((row) => row.eventId === event.id)?.status ?? "PENDING",
                canAnswer: event.startDate > now,
              }
            : null,
          callUps:
            isManaged && isMatch
              ? {
                  confirmed: count(callUpCounts, event.id, "CONFIRMED"),
                  pending: count(callUpCounts, event.id, "PENDING"),
                  declined: count(callUpCounts, event.id, "DECLINED") + count(callUpCounts, event.id, "EXPIRED"),
                  players,
                  canSend: sendCallUpError(event.startDate, now) === null,
                }
              : null,
          attendance:
            isManaged && !isMatch
              ? { present: count(attendanceCounts, event.id, "PRESENT"), absent: count(attendanceCounts, event.id, "ABSENT"), players }
              : null,
          motmVote: canVote
            ? { closesAt: motmWindow(event.startDate, now).closesAt, hasVoted: myVotes.some((vote) => vote.eventId === event.id) }
            : null,
        },
      ] as const;
    }),
  );
}

export type Participation = NonNullable<ReturnType<Awaited<ReturnType<typeof participationOf>>["get"]>>;
