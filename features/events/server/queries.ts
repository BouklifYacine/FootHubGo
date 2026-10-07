import { prisma } from "@/prisma";
import type { EventType, Prisma } from "@/generated/prisma/client";
import { notFound } from "@/lib/errors";

export type EventFilters = { from?: Date; to?: Date; type?: EventType };

/**
 * Events of a team (used by the events list and the calendar), oldest first,
 * with the caller's own attendance and whether the event is locked by team stats.
 */
export async function listEvents(teamId: string, userId: string, { from, to, type }: EventFilters = {}) {
  const where: Prisma.EventWhereInput = {
    teamId,
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
      seriesId: true,
      teamStat: { select: { id: true } },
      attendances: { where: { userId }, select: { status: true } },
    },
  });

  return events.map(({ teamStat, attendances, ...event }) => ({
    ...event,
    hasStats: teamStat !== null,
    myAttendance: attendances[0]?.status ?? "PENDING",
  }));
}

/** One event of the team, with its score and the training attendances. */
export async function getEvent(eventId: string, teamId: string) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      type: true,
      startDate: true,
      opponent: true,
      team: { select: { name: true, logoUrl: true } },
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

  const { attendances, ...rest } = event;
  return {
    ...rest,
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

/** The caller's attendances (most recent first). */
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
