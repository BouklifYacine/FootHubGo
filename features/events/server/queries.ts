import { prisma } from "@/prisma";
import type { EventType, Prisma } from "@/generated/prisma/client";
import { notFound } from "@/lib/errors";
import type { Membership } from "@/lib/auth/session";
import { canManageSection, sectionDisplayName } from "@/features/clubs/rules";
import { participationOf } from "./participation";

export type EventFilters = { from?: Date; to?: Date; type?: EventType };

/** Events visible in a section: its own events and the club-wide ones (`teamId: null`). */
export const sectionEventsWhere = (scope: { clubId: string; teamId: string }): Prisma.EventWhereInput => ({
  clubId: scope.clubId,
  OR: [{ teamId: scope.teamId }, { teamId: null }],
});

/**
 * Events of the active section and of the whole club (used by the agenda list and calendar),
 * oldest first, with "who is coming" from the caller's point of view (participationOf), the score,
 * whether the event is locked by team stats and whether the caller can edit it.
 */
export async function listEvents(membership: Membership, userId: string, { from, to, type }: EventFilters = {}) {
  const where: Prisma.EventWhereInput = {
    ...sectionEventsWhere(membership),
    type,
    startDate: from || to ? { gte: from, lt: to } : undefined,
  };

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      type: true,
      startDate: true,
      opponent: true,
      isHome: true,
      seriesId: true,
      teamId: true,
      teamStat: { select: { id: true, result: true, goalsFor: true, goalsAgainst: true } },
    },
  });

  const participation = await participationOf(events, membership, userId);
  return events.map(({ teamStat, ...event }) => ({
    ...event,
    isClubEvent: event.teamId === null,
    canEdit: canManageSection(membership, event.teamId),
    hasStats: teamStat !== null,
    score: teamStat ? { result: teamStat.result, goalsFor: teamStat.goalsFor, goalsAgainst: teamStat.goalsAgainst } : null,
    ...participation.get(event.id)!,
  }));
}

/** One event of the section (or a club-wide one), with its score and the training attendances. */
export async function getEvent(eventId: string, membership: Membership, userId: string) {
  const teamId = membership.teamId;
  const event = await prisma.event.findFirst({
    where: { id: eventId, ...sectionEventsWhere(membership) },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      type: true,
      startDate: true,
      opponent: true,
      isHome: true,
      seriesId: true,
      teamId: true,
      team: { select: { name: true } },
      club: { select: { name: true, logoUrl: true } },
      teamStat: { select: { result: true, goalsFor: true, goalsAgainst: true } },
      attendances: {
        select: {
          status: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              memberships: { where: { teamId }, select: { position: true } },
            },
          },
        },
      },
    },
  });
  if (!event) throw notFound("Événement introuvable");

  const { attendances, team, club, teamId: eventTeamId, ...rest } = event;
  const participation = await participationOf([event], membership, userId);
  return {
    ...rest,
    ...participation.get(event.id)!,
    // Club-wide events show the club; section events "Club · Section".
    team: { name: team ? sectionDisplayName(club.name, team.name) : club.name, logoUrl: club.logoUrl },
    isClubEvent: eventTeamId === null,
    canEdit: canManageSection(membership, eventTeamId),
    hasStats: event.teamStat !== null,
    attendances: attendances.map(({ status, user }) => ({
      status,
      userId: user.id,
      name: user.name,
      image: user.image,
      position: user.memberships[0]?.position ?? null,
    })),
  };
}

/** The caller's attendances in a section (most recent first). */
export async function listMyAttendances(userId: string, teamId: string) {
  return prisma.attendance.findMany({
    where: { userId, event: { teamId } },
    orderBy: { event: { startDate: "desc" } },
    select: {
      status: true,
      createdAt: true,
      event: { select: { id: true, title: true, type: true, location: true, startDate: true } },
    },
  });
}
