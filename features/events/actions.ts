"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireMember, type Membership } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { canManageSection } from "@/features/clubs/rules";
import { notifyUsers } from "@/features/notifications/server/notify-user";
import { formatDateTime } from "@/lib/format";
import { TEAM_TIME_ZONE, weeklyOccurrences } from "./recurrence";
import { rescheduleOutcome } from "./reschedule";
import { attendanceSchema, deleteEventSchema, eventSchema, moveEventSchema, updateEventSchema } from "./schemas";

type EventData = Omit<z.output<typeof eventSchema>, "repeatUntil" | "scope">;

/** Where events live: a section (`teamId`) or the whole club (`teamId: null`). */
type EventScope = { clubId: string; teamId: string | null };

/**
 * Scope of a new event: the active section by default; "CLUB" (club-wide) or another section of the
 * club for its coaches and the club OWNER / ADMIN. Never trusts the id from the client.
 */
async function resolveScope(membership: Membership, scope: string | undefined): Promise<EventScope> {
  const teamId = scope === "CLUB" ? null : (scope ?? membership.teamId);
  if (teamId && teamId !== membership.teamId) {
    const section = await prisma.team.findFirst({ where: { id: teamId, clubId: membership.clubId }, select: { id: true } });
    if (!section) throw notFound("Section introuvable");
  }
  if (!canManageSection(membership, teamId)) {
    throw forbidden(
      teamId === null
        ? "Seuls le propriétaire et les administrateurs créent des événements pour tout le club"
        : "Tu dois être entraîneur de la section",
    );
  }
  return { clubId: membership.clubId, teamId };
}

/** Same section / club-wide slot: two events of the same scope can't start at the same time. */
const scopeWhere = ({ clubId, teamId }: EventScope) => ({ clubId, teamId });

/** Normalizes form values into DB columns (a training has no opponent). */
function toEventColumns({ title, type, startDate, location, opponent, description, isHome }: EventData) {
  return {
    title,
    type,
    startDate,
    location: location || null,
    description: description || null,
    opponent: type === "TRAINING" ? null : opponent || null,
    // A training (and a club-wide event) is never "away": no carpool.
    isHome: type === "TRAINING" ? true : (isHome ?? true),
  };
}

/**
 * An event visible in the caller's active section (its own or a club-wide one) that the caller
 * manages (section coach, or OWNER / ADMIN for club-wide events) and that is not locked by match stats.
 */
async function findEditableEvent(eventId: string, membership: Membership) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, clubId: membership.clubId, OR: [{ teamId: membership.teamId }, { teamId: null }] },
    select: {
      id: true,
      clubId: true,
      teamId: true,
      seriesId: true,
      title: true,
      opponent: true,
      startDate: true,
      motmOpenNotifiedAt: true,
      motmClosedAt: true,
      teamStat: { select: { id: true } },
      _count: { select: { motmVotes: true } },
    },
  });
  if (!event) throw notFound("Événement introuvable");
  if (!canManageSection(membership, event.teamId)) {
    throw forbidden(event.teamId ? "Tu dois être entraîneur de la section" : "Réservé au propriétaire et aux administrateurs du club");
  }
  if (event.teamStat) {
    throw new AppError("Cet événement a des statistiques enregistrées : il ne peut plus être modifié ni supprimé", 409);
  }
  return event;
}

async function assertNoEventAt(scope: EventScope, startDate: Date, ignoreEventId?: string) {
  const existing = await prisma.event.findFirst({
    where: { ...scopeWhere(scope), startDate, id: ignoreEventId ? { not: ignoreEventId } : undefined },
    select: { id: true },
  });
  if (existing) throw new AppError("Un événement existe déjà à cette date et heure", 409);
}

type EditableEvent = Awaited<ReturnType<typeof findEditableEvent>>;

/** Job flags to reset when the start date changes (throws once the man-of-the-match vote has started). */
function rescheduleColumns(event: EditableEvent, startDate: Date) {
  const outcome = rescheduleOutcome({ ...event, motmVoteCount: event._count.motmVotes }, startDate);
  if ("error" in outcome) throw new AppError(outcome.error, 409);
  return outcome.reset ?? {};
}

/** Drivers and passengers of a moved match: their departure time is probably wrong now. */
async function notifyCarpoolOfMove(event: EditableEvent, startDate: Date) {
  if (event.startDate.getTime() === startDate.getTime()) return;
  const rides = await prisma.ride.findMany({
    where: { eventId: event.id },
    select: { driverId: true, passengers: { select: { userId: true } } },
  });
  const userIds = [...new Set(rides.flatMap((ride) => [ride.driverId, ...ride.passengers.map((p) => p.userId)]))];
  if (userIds.length === 0) return;
  await notifyUsers(userIds, {
    type: "CARPOOL",
    title: "Match déplacé",
    message: `Le match ${event.opponent ? `contre ${event.opponent}` : event.title} a lieu le ${formatDateTime(startDate, { timeZone: TEAM_TIME_ZONE })}. Vérifiez l'heure de départ du covoiturage.`,
    url: `/app/events/${event.id}`,
  });
}

/** One event, or a weekly series of trainings; dates already taken by another event are skipped. */
export const createEvent = action(eventSchema, async ({ repeatUntil, scope: requestedScope, ...input }) => {
  const { membership } = await requireMember();
  const scope = await resolveScope(membership, requestedScope);
  const dates = repeatUntil ? weeklyOccurrences(input.startDate, repeatUntil) : [input.startDate];

  const taken = await prisma.event.findMany({
    where: { ...scopeWhere(scope), startDate: { in: dates } },
    select: { startDate: true },
  });
  const takenTimes = new Set(taken.map((event) => event.startDate.getTime()));
  const free = dates.filter((date) => !takenTimes.has(date.getTime()));
  if (free.length === 0) throw new AppError("Un événement existe déjà à cette date et heure", 409);

  const seriesId = dates.length > 1 ? randomUUID() : null;
  const created = await prisma.event.createManyAndReturn({
    data: free.map((startDate) => ({ ...toEventColumns({ ...input, startDate }), ...scope, seriesId })),
    select: { id: true },
  });
  // The form offers "Convoquer maintenant" right after a match is created.
  const data = { eventId: created[0].id, type: input.type, title: input.title };

  if (dates.length === 1) return { message: "Événement créé", data };
  const skipped = dates.length - free.length;
  return {
    message: `${free.length} entraînements créés${skipped ? ` (${skipped} ignoré${skipped > 1 ? "s" : ""} : créneau déjà pris)` : ""}`,
    data,
  };
});

export const updateEvent = action(updateEventSchema, async ({ eventId, ...input }) => {
  const { membership } = await requireMember();
  const event = await findEditableEvent(eventId, membership);
  await assertNoEventAt(event, input.startDate, event.id);
  const columns = { ...toEventColumns(input), ...rescheduleColumns(event, input.startDate) };
  // Rides only exist for away matches: they are cancelled by their drivers, never silently dropped.
  // Checked under the event row lock that `offerRide` also takes, so a ride can't slip in meanwhile.
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "evenement" WHERE "id" = ${event.id} FOR UPDATE`;
    if (columns.isHome && (await tx.ride.count({ where: { eventId: event.id } })) > 0) {
      throw new AppError("Des covoiturages sont proposés pour ce match : les conducteurs doivent d'abord les annuler", 409);
    }
    await tx.event.update({ where: { id: event.id }, data: columns });
  });
  await notifyCarpoolOfMove(event, input.startDate);
  return { message: "Événement modifié" };
});

/** Drag & drop in the calendar: only the start date changes. */
export const moveEvent = action(moveEventSchema, async ({ eventId, startDate }) => {
  const { membership } = await requireMember();
  const event = await findEditableEvent(eventId, membership);
  await assertNoEventAt(event, startDate, event.id);
  await prisma.event.update({ where: { id: event.id }, data: { startDate, ...rescheduleColumns(event, startDate) } });
  await notifyCarpoolOfMove(event, startDate);
  return { message: "Événement déplacé" };
});

export const deleteEvent = action(deleteEventSchema, async ({ eventId, withFollowing }) => {
  const { membership } = await requireMember();
  const event = await findEditableEvent(eventId, membership);

  if (!withFollowing || !event.seriesId) {
    await prisma.event.delete({ where: { id: event.id } });
    return { message: "Événement supprimé" };
  }

  // This occurrence and the following ones; occurrences locked by stats stay.
  const { count } = await prisma.event.deleteMany({
    where: { ...scopeWhere(event), seriesId: event.seriesId, startDate: { gte: event.startDate }, teamStat: null },
  });
  return { message: `${count} entraînement${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}` };
});

/** A player says whether they will attend an upcoming training of their section (not a club-wide event). */
export const setAttendance = action(attendanceSchema, async ({ eventId, status }) => {
  const { user, membership } = await requireMember();
  if (membership.role !== "PLAYER") throw forbidden("Seuls les joueurs peuvent indiquer leur présence");

  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId: membership.teamId },
    select: { id: true, type: true, startDate: true },
  });
  if (!event) throw notFound("Événement introuvable");
  if (event.type !== "TRAINING") throw new AppError("La présence ne se déclare que pour les entraînements");
  if (event.startDate < new Date()) throw new AppError("L'entraînement est déjà passé");

  await prisma.attendance.upsert({
    where: { userId_eventId: { userId: user.id, eventId: event.id } },
    update: { status },
    create: { userId: user.id, eventId: event.id, status },
  });
  return { message: "Présence enregistrée" };
});
