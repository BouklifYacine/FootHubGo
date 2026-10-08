"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { requireMember, requireUser } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { playerPositionLabels } from "@/lib/enum-labels";
import { notifyUser, notifyUsers } from "@/features/notifications/server/notify-user";
import { canManageSection, sectionDisplayName } from "@/features/clubs/rules";
import { addToSection, sectionManagerIds } from "@/features/clubs/server/membership";
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

  // The request targets one section of the club.
  const section = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, name: true, clubId: true, club: { select: { name: true, visibility: true } } },
  });
  if (!section) throw notFound("Section introuvable");
  if (section.club.visibility !== "PUBLIC") throw forbidden("Ce club n'accepte pas de demandes d'adhésion.");

  // A member of a club can only apply to another section of their own club.
  const clubMember = await prisma.clubMember.findUnique({
    where: { userId: user.id },
    select: { clubId: true, sectionMemberships: { select: { teamId: true } } },
  });
  if (clubMember && clubMember.clubId !== section.clubId) {
    throw new AppError("Vous avez déjà un club. Quittez-le avant de postuler ailleurs.");
  }
  if (clubMember?.sectionMemberships.some((m) => m.teamId === section.id)) {
    throw new AppError("Vous faites déjà partie de cette section.");
  }

  const pending = await prisma.joinRequest.findMany({
    where: { userId: user.id, status: "PENDING" },
    select: { teamId: true },
  });
  if (pending.some((request) => request.teamId === teamId)) {
    throw new AppError("Vous avez déjà une demande en cours pour cette section.");
  }
  if (pending.length >= MAX_PENDING_REQUESTS) {
    throw new AppError(`Vous avez atteint la limite de ${MAX_PENDING_REQUESTS} demandes en attente.`);
  }

  await prisma.joinRequest.create({ data: { ...input, teamId, userId: user.id } });

  // Reviewed by the section's coaches and the club OWNER / ADMIN.
  const name = sectionDisplayName(section.club.name, section.name);
  await notifyUsers(await sectionManagerIds(section.id, section.clubId, user.id), {
    type: "JOIN_REQUEST",
    title: "Nouvelle demande d'adhésion",
    message: `${user.name} souhaite rejoindre ${name} au poste de ${playerPositionLabels[input.position]}.`,
    url: "/app/join-requests",
    fromUserName: user.name,
    fromUserImage: user.image,
  });

  return { message: `Votre demande pour rejoindre ${name} a été envoyée` };
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

/** By the section's coaches or the club OWNER / ADMIN; requests of other clubs are never visible. */
export const reviewJoinRequest = action(reviewJoinRequestSchema, async ({ requestId, decision }) => {
  const { membership } = await requireMember();

  const request = await prisma.joinRequest.findFirst({
    where: { id: requestId, team: { clubId: membership.clubId } },
    include: { team: { select: { id: true, name: true, clubId: true } } },
  });
  if (!request) throw notFound("Demande introuvable");
  if (!canManageSection(membership, request.teamId)) {
    throw forbidden("Réservé aux entraîneurs de la section et aux administrateurs du club");
  }

  // Claimed first: a concurrent review cannot handle it twice.
  const claimed = await prisma.joinRequest.updateMany({
    where: { id: request.id, status: "PENDING" },
    data: { status: decision },
  });
  if (claimed.count === 0) throw new AppError("Cette demande a déjà été traitée.");

  const accepted = decision === "ACCEPTED";
  if (accepted) {
    try {
      // One club per user and once per section are enforced by unique indexes (audit L13).
      await addToSection({
        userId: request.userId,
        section: { id: request.team.id, clubId: request.team.clubId },
        role: "PLAYER",
        position: request.position,
        conflictMessage: "Ce joueur appartient déjà à un autre club ou à cette section.",
      });
    } catch (error) {
      await prisma.joinRequest.update({ where: { id: request.id }, data: { status: "PENDING" } });
      throw error;
    }
  }

  const name = sectionDisplayName(membership.club.name, request.team.name);
  await notifyUser({
    userId: request.userId,
    type: accepted ? "JOINED_TEAM" : "JOIN_REQUEST",
    title: accepted ? "Bienvenue dans l'équipe !" : "Réponse à ta demande",
    message: accepted
      ? `Ta demande pour rejoindre ${name} a été acceptée.`
      : `${name} n'a pas retenu ta candidature pour le moment.`,
    url: accepted ? "/app" : "/app/join-requests",
    fromUserName: membership.club.name,
    fromUserImage: membership.club.logoUrl,
  });

  return { message: accepted ? "Demande acceptée" : "Demande refusée" };
});
