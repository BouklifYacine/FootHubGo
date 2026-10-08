"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireCoach, requireMember } from "@/lib/auth/session";
import { AppError, notFound } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { TEAM_TIME_ZONE } from "@/features/events/recurrence";
import { notifyUsers } from "@/features/notifications/server/notify-user";
import { replyCallUpSchema, sendCallUpsSchema } from "./schemas";
import { cancelCallUpError, injuriesOnDay, replyCallUpError, sendCallUpError } from "./server/rules";

/** Calls up one or several players. Injured or already called-up players are skipped (and counted). */
export const sendCallUps = action(sendCallUpsSchema, async ({ eventId, playerIds }) => {
  const { user, membership } = await requireCoach();

  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId: membership.teamId },
    select: { id: true, title: true, type: true, startDate: true },
  });
  if (!event) throw notFound("Événement introuvable");
  if (event.type === "TRAINING") throw new AppError("On ne convoque pas pour un entraînement");
  const timeError = sendCallUpError(event.startDate);
  if (timeError) throw new AppError(timeError);

  // Only players of the coach's team: ids from the client are never trusted as-is
  const players = await prisma.teamMember.findMany({
    where: { teamId: membership.teamId, role: "PLAYER", userId: { in: playerIds } },
    select: {
      userId: true,
      user: {
        select: {
          name: true,
          injuries: { where: injuriesOnDay(event.startDate), select: { id: true }, take: 1 },
          callUps: { where: { eventId: event.id }, select: { id: true } },
        },
      },
    },
  });
  if (players.length === 0) throw notFound("Aucun joueur de l'équipe sélectionné");

  const toCall = players.filter(({ user }) => user.injuries.length === 0 && user.callUps.length === 0);
  if (toCall.length === 0) {
    throw new AppError(players.length === 1 ? "Ce joueur est blessé ou déjà convoqué" : "Ces joueurs sont blessés ou déjà convoqués");
  }

  await prisma.callUp.createMany({
    data: toCall.map(({ userId }) => ({ userId, eventId: event.id })),
    skipDuplicates: true,
  });
  await notifyUsers(
    toCall.map(({ userId }) => userId),
    {
      type: "CALL_UP",
      title: "Convocation",
      message: `Tu es convoqué : ${event.title}, ${formatDateTime(event.startDate, { timeZone: TEAM_TIME_ZONE })}. Dis à ton coach si tu es dispo.`,
      url: `/app/events/${event.id}`,
      fromUserName: user.name,
      fromUserImage: user.image,
    },
  );

  const skipped = new Set(playerIds).size - toCall.length;
  const sent = toCall.length === 1 ? `Convocation envoyée à ${toCall[0].user.name}` : `${toCall.length} convocations envoyées`;
  return { message: skipped > 0 ? `${sent} (${skipped} ignorée${skipped > 1 ? "s" : ""})` : sent };
});

export const cancelCallUp = action(z.string().min(1), async (callUpId) => {
  const { membership } = await requireCoach();

  const callUp = await prisma.callUp.findFirst({
    where: { id: callUpId, event: { teamId: membership.teamId } },
    select: { id: true, event: { select: { startDate: true } } },
  });
  if (!callUp) throw notFound("Convocation introuvable");
  const timeError = cancelCallUpError(callUp.event.startDate);
  if (timeError) throw new AppError(timeError);

  await prisma.callUp.delete({ where: { id: callUp.id } });
  return { message: "Convocation annulée" };
});

export const replyToCallUp = action(replyCallUpSchema, async ({ callUpId, status }) => {
  const { user, membership } = await requireMember();

  // The call-up must belong to the caller and to an event of one of their sections (not only the
  // active one: "Mes convocations" lists them all)
  const callUp = await prisma.callUp.findFirst({
    where: {
      id: callUpId,
      userId: user.id,
      event: { teamId: { in: membership.sections.map((section) => section.teamId) } },
    },
    select: { id: true, status: true, event: { select: { id: true, title: true, startDate: true, teamId: true } } },
  });
  if (!callUp) throw notFound("Convocation introuvable");
  if (callUp.status === "EXPIRED") throw new AppError("Cette convocation a expiré", 409);
  // The answer can be given, or changed, until the deadline (3h before the match).
  const timeError = replyCallUpError(callUp.event.startDate);
  if (timeError) throw new AppError(timeError);
  if (callUp.status === status) return { message: "Réponse enregistrée" };

  // Conditional update: two concurrent answers can't both apply on the same previous state.
  const { count } = await prisma.callUp.updateMany({
    where: { id: callUp.id, status: callUp.status },
    data: { status, respondedAt: new Date() },
  });
  if (count === 0) throw new AppError("Ta réponse vient de changer sur un autre appareil, recharge la page", 409);
  const changed = callUp.status !== "PENDING";

  const coaches = await prisma.teamMember.findMany({
    where: { teamId: callUp.event.teamId ?? membership.teamId, role: "COACH", userId: { not: user.id } },
    select: { userId: true },
  });
  const verb = status === "CONFIRMED" ? "est dispo pour" : "n'est pas dispo pour";
  await notifyUsers(
    coaches.map((coach) => coach.userId),
    {
      type: "CALL_UP",
      title: changed ? "Réponse modifiée" : "Réponse à une convocation",
      message: `${user.name} ${verb} ${callUp.event.title}`,
      url: `/app/events/${callUp.event.id}`,
      fromUserName: user.name,
      fromUserImage: user.image,
    },
  );
  return { message: status === "CONFIRMED" ? "C'est noté : tu es dispo" : "C'est noté : tu n'es pas dispo" };
});
