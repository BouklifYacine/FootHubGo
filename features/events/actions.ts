"use server";

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireCoach, requireMember } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { weeklyOccurrences } from "./recurrence";
import { attendanceSchema, deleteEventSchema, eventSchema, moveEventSchema, updateEventSchema } from "./schemas";

type EventData = Omit<z.output<typeof eventSchema>, "repeatUntil">;

/** Normalizes form values into DB columns (a training has no opponent). */
function toEventColumns({ title, type, startDate, location, opponent }: EventData) {
  return {
    title,
    type,
    startDate,
    location: location || null,
    opponent: type === "TRAINING" ? null : opponent || null,
  };
}

/** An event of the coach's team that can still be changed (not locked by match stats). */
async function findEditableEvent(eventId: string, teamId: string) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId },
    select: { id: true, seriesId: true, startDate: true, teamStat: { select: { id: true } } },
  });
  if (!event) throw notFound("Événement introuvable");
  if (event.teamStat) {
    throw new AppError("Cet événement a des statistiques enregistrées : il ne peut plus être modifié ni supprimé", 409);
  }
  return event;
}

async function assertNoEventAt(teamId: string, startDate: Date, ignoreEventId?: string) {
  const existing = await prisma.event.findFirst({
    where: { teamId, startDate, id: ignoreEventId ? { not: ignoreEventId } : undefined },
    select: { id: true },
  });
  if (existing) throw new AppError("Un événement existe déjà à cette date et heure", 409);
}

/** One event, or a weekly series of trainings; dates already taken by another event are skipped. */
export const createEvent = action(eventSchema, async ({ repeatUntil, ...input }) => {
  const { membership } = await requireCoach();
  const teamId = membership.teamId;
  const dates = repeatUntil ? weeklyOccurrences(input.startDate, repeatUntil) : [input.startDate];

  const taken = await prisma.event.findMany({
    where: { teamId, startDate: { in: dates } },
    select: { startDate: true },
  });
  const takenTimes = new Set(taken.map((event) => event.startDate.getTime()));
  const free = dates.filter((date) => !takenTimes.has(date.getTime()));
  if (free.length === 0) throw new AppError("Un événement existe déjà à cette date et heure", 409);

  const seriesId = dates.length > 1 ? randomUUID() : null;
  await prisma.event.createMany({
    data: free.map((startDate) => ({ ...toEventColumns({ ...input, startDate }), teamId, seriesId })),
  });

  if (dates.length === 1) return { message: "Événement créé" };
  const skipped = dates.length - free.length;
  return {
    message: `${free.length} entraînements créés${skipped ? ` (${skipped} ignoré${skipped > 1 ? "s" : ""} : créneau déjà pris)` : ""}`,
  };
});

export const updateEvent = action(updateEventSchema, async ({ eventId, ...input }) => {
  const { membership } = await requireCoach();
  const event = await findEditableEvent(eventId, membership.teamId);
  await assertNoEventAt(membership.teamId, input.startDate, event.id);
  await prisma.event.update({ where: { id: event.id }, data: toEventColumns(input) });
  return { message: "Événement modifié" };
});

/** Drag & drop in the calendar: only the start date changes. */
export const moveEvent = action(moveEventSchema, async ({ eventId, startDate }) => {
  const { membership } = await requireCoach();
  const event = await findEditableEvent(eventId, membership.teamId);
  await assertNoEventAt(membership.teamId, startDate, event.id);
  await prisma.event.update({ where: { id: event.id }, data: { startDate } });
  return { message: "Événement déplacé" };
});

export const deleteEvent = action(deleteEventSchema, async ({ eventId, withFollowing }) => {
  const { membership } = await requireCoach();
  const event = await findEditableEvent(eventId, membership.teamId);

  if (!withFollowing || !event.seriesId) {
    await prisma.event.delete({ where: { id: event.id } });
    return { message: "Événement supprimé" };
  }

  // This occurrence and the following ones; occurrences locked by stats stay.
  const { count } = await prisma.event.deleteMany({
    where: { teamId: membership.teamId, seriesId: event.seriesId, startDate: { gte: event.startDate }, teamStat: null },
  });
  return { message: `${count} entraînement${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}` };
});

/** A player says whether they will attend an upcoming training. */
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
