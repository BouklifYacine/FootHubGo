"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { findMembership, requireCoach, requireUser } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { playerPositionLabels } from "@/lib/enum-labels";
import { notifyUser, notifyUsers } from "@/features/notifications/server/notify-user";
import { syncChatOnMemberJoined } from "@/features/team/server/team-chat";
import {
  reviewJoinRequestSchema,
  sendJoinRequestSchema,
  updateJoinRequestSchema,
} from "./schemas";

const MAX_PENDING_REQUESTS = 3;

/** A request owned by the current user. */
async function findOwnRequest(requestId: string, userId: string) {
  const request = await prisma.joinRequest.findFirst({ where: { id: requestId, userId } });
  if (!request) throw notFound("Demande introuvable");
  return request;
}

/** Each request notifies the coaches: 10 per hour per user (send / cancel loops included). */
const joinRequestBudget = rateLimiter("join-requests", { max: 10, windowMs: 60 * 60_000 });

export const sendJoinRequest = action(sendJoinRequestSchema, async ({ teamId, ...input }) => {
  const user = await requireUser();
  enforceRateLimit([[joinRequestBudget, user.id]], "Trop de demandes envoyées. Réessayez plus tard.");

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { name: true, logoUrl: true, visibility: true },
  });
  if (!team) throw notFound("Club introuvable");
  if (team.visibility !== "PUBLIC") throw forbidden("Ce club n'accepte pas de demandes d'adhésion.");
  if (await findMembership(user.id)) {
    throw new AppError("Vous avez déjà un club. Quittez-le avant de postuler ailleurs.");
  }

  const pending = await prisma.joinRequest.findMany({
    where: { userId: user.id, status: "PENDING" },
    select: { teamId: true },
  });
  if (pending.some((request) => request.teamId === teamId)) {
    throw new AppError("Vous avez déjà une demande en cours pour ce club.");
  }
  if (pending.length >= MAX_PENDING_REQUESTS) {
    throw new AppError(`Vous avez atteint la limite de ${MAX_PENDING_REQUESTS} demandes en attente.`);
  }

  await prisma.joinRequest.create({ data: { ...input, teamId, userId: user.id } });

  const coaches = await prisma.teamMember.findMany({
    where: { teamId, role: "COACH" },
    select: { userId: true },
  });
  await notifyUsers(
    coaches.map((coach) => coach.userId),
    {
      type: "JOIN_REQUEST",
      title: "Nouvelle demande d'adhésion",
      message: `${user.name} souhaite rejoindre le club au poste de ${playerPositionLabels[input.position]}.`,
      fromUserName: user.name,
      fromUserImage: user.image,
    },
  );

  return { message: `Votre demande pour rejoindre ${team.name} a été envoyée` };
});

export const updateJoinRequest = action(updateJoinRequestSchema, async ({ requestId, ...input }) => {
  const user = await requireUser();
  const request = await findOwnRequest(requestId, user.id);
  if (request.status !== "PENDING") throw new AppError("Impossible de modifier une demande déjà traitée.");

  await prisma.joinRequest.update({ where: { id: request.id }, data: input });
  return { message: "Votre demande a été mise à jour" };
});

export const cancelJoinRequest = action(z.string().min(1), async (requestId) => {
  const user = await requireUser();
  const request = await findOwnRequest(requestId, user.id);
  if (request.status === "ACCEPTED") {
    throw new AppError("Cette demande a été acceptée : utilisez « Quitter le club ».");
  }

  await prisma.joinRequest.delete({ where: { id: request.id } });
  return { message: "Votre demande a été supprimée" };
});

export const reviewJoinRequest = action(reviewJoinRequestSchema, async ({ requestId, decision }) => {
  const { membership } = await requireCoach();
  const { team } = membership;

  // Scoped to the coach's team: a coach can only review requests sent to their own club.
  const request = await prisma.joinRequest.findFirst({ where: { id: requestId, teamId: team.id } });
  if (!request) throw notFound("Demande introuvable");

  await prisma.$transaction(async (tx) => {
    const updated = await tx.joinRequest.updateMany({
      where: { id: request.id, status: "PENDING" },
      data: { status: decision },
    });
    if (updated.count === 0) throw new AppError("Cette demande a déjà été traitée.");
    if (decision === "REJECTED") return;

    // Re-checked inside the transaction: the applicant may have joined another club meanwhile.
    const existing = await tx.teamMember.findFirst({ where: { userId: request.userId } });
    if (existing) throw new AppError("Ce joueur appartient déjà à un club.");

    await tx.teamMember.create({
      data: { userId: request.userId, teamId: team.id, role: "PLAYER", position: request.position },
    });
    await tx.joinRequest.deleteMany({
      where: { userId: request.userId, status: "PENDING", id: { not: request.id } },
    });
  });

  const accepted = decision === "ACCEPTED";
  if (accepted) await syncChatOnMemberJoined(team.id, request.userId);

  await notifyUser({
    userId: request.userId,
    type: accepted ? "JOINED_TEAM" : "JOIN_REQUEST",
    title: accepted ? "Bienvenue dans l'équipe !" : "Réponse à votre demande",
    message: accepted
      ? `L'entraîneur a accepté votre demande pour rejoindre ${team.name}.`
      : `L'entraîneur de ${team.name} n'a pas retenu votre candidature pour le moment.`,
    fromUserName: team.name,
    fromUserImage: team.logoUrl,
  });

  return { message: accepted ? "Demande acceptée" : "Demande refusée" };
});
