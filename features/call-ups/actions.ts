"use server";

import { format } from "date-fns";
import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireCoach, requireMember } from "@/lib/auth/session";
import { AppError, notFound } from "@/lib/errors";
import { notifyUsers } from "@/features/notifications/server/notify-user";
import { replyCallUpSchema, sendCallUpsSchema } from "./schemas";
import { cancelCallUpError, injuriesOnDay, replyCallUpError, sendCallUpError } from "./server/rules";

/** Calls up one or several players. Injured or already called-up players are skipped (and counted). */
export const sendCallUps = action(sendCallUpsSchema, async ({ eventId, playerIds }) => {
  const { user, membership } = await requireCoach();

  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId: membership.teamId },
    select: { id: true, type: true, startDate: true },
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
      message: `Tu es convoqué pour le match du ${format(event.startDate, "dd/MM/yyyy")}`,
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

  // The call-up must belong to the caller and to an event of their team
  const callUp = await prisma.callUp.findFirst({
    where: { id: callUpId, userId: user.id, event: { teamId: membership.teamId } },
    select: { id: true, status: true, event: { select: { title: true, startDate: true } } },
  });
  if (!callUp) throw notFound("Convocation introuvable");
  if (callUp.status !== "PENDING") throw new AppError("Vous avez déjà répondu à cette convocation", 409);
  const timeError = replyCallUpError(callUp.event.startDate);
  if (timeError) throw new AppError(timeError);

  // Conditional update: a concurrent answer cannot overwrite the first one
  const { count } = await prisma.callUp.updateMany({
    where: { id: callUp.id, status: "PENDING" },
    data: { status, respondedAt: new Date() },
  });
  if (count === 0) throw new AppError("Vous avez déjà répondu à cette convocation", 409);

  const coaches = await prisma.teamMember.findMany({
    where: { teamId: membership.teamId, role: "COACH", userId: { not: user.id } },
    select: { userId: true },
  });
  const verb = status === "CONFIRMED" ? "a confirmé sa présence pour" : "a refusé la convocation pour";
  await notifyUsers(
    coaches.map((coach) => coach.userId),
    {
      type: "CALL_UP",
      title: "Réponse à une convocation",
      message: `${user.name} ${verb} ${callUp.event.title}`,
      fromUserName: user.name,
      fromUserImage: user.image,
    },
  );
  return { message: "Réponse enregistrée" };
});
