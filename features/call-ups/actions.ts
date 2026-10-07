"use server";

import { format } from "date-fns";
import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireCoach, requireMember } from "@/lib/auth/session";
import { AppError, notFound } from "@/lib/errors";
import { notifyUser, notifyUsers } from "@/features/notifications/server/notify-user";
import { replyCallUpSchema, sendCallUpSchema } from "./schemas";
import { cancelCallUpError, injuriesOnDay, replyCallUpError, sendCallUpError } from "./server/rules";

export const sendCallUp = action(sendCallUpSchema, async ({ eventId, playerId }) => {
  const { user, membership } = await requireCoach();

  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId: membership.teamId },
    select: { id: true, type: true, startDate: true },
  });
  if (!event) throw notFound("Événement introuvable");
  if (event.type === "TRAINING") throw new AppError("On ne convoque pas pour un entraînement");
  const timeError = sendCallUpError(event.startDate);
  if (timeError) throw new AppError(timeError);

  const player = await prisma.teamMember.findFirst({
    where: { userId: playerId, teamId: membership.teamId },
    select: {
      role: true,
      user: {
        select: {
          name: true,
          injuries: { where: injuriesOnDay(event.startDate), select: { id: true }, take: 1 },
          callUps: { where: { eventId: event.id }, select: { id: true } },
        },
      },
    },
  });
  if (!player) throw notFound("Ce joueur ne fait pas partie de l'équipe");
  if (player.role !== "PLAYER") throw new AppError("Seuls les joueurs peuvent être convoqués");
  if (player.user.callUps.length > 0) throw new AppError("Ce joueur est déjà convoqué", 409);
  if (player.user.injuries.length > 0) throw new AppError("Ce joueur est blessé le jour du match");

  await prisma.callUp.create({ data: { userId: playerId, eventId: event.id } });
  await notifyUser({
    userId: playerId,
    type: "CALL_UP",
    title: "Convocation",
    message: `Tu es convoqué pour le match du ${format(event.startDate, "dd/MM/yyyy")}`,
    fromUserName: user.name,
    fromUserImage: user.image,
  });
  return { message: `Convocation envoyée à ${player.user.name}` };
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
