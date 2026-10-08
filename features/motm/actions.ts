"use server";

import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireMember } from "@/lib/auth/session";
import { AppError, notFound } from "@/lib/errors";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { motmVoteError, motmWindow } from "./rules";
import { motmVoteSchema } from "./schemas";
import { presentPlayersWhere } from "./server/queries";

/** A vote can be changed until the end: 20 changes per 10 minutes is plenty for a human. */
const voteLimiter = rateLimiter("motm-vote", { max: 20, windowMs: 10 * 60_000 });

/**
 * Votes (or changes the vote) for the man of the match. The match must belong to one of the caller's
 * sections; the voter and the nominee are checked against the call-ups (ids are never trusted).
 */
export const voteManOfTheMatch = action(motmVoteSchema, async ({ eventId, nomineeId }) => {
  const { user, membership } = await requireMember();
  enforceRateLimit([[voteLimiter, user.id]], "Trop de votes d'affilée. Réessaie dans quelques minutes.");

  const sectionIds = membership.sections.map((section) => section.teamId);
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId: { in: sectionIds } },
    select: { id: true, type: true, teamId: true, startDate: true },
  });
  if (!event || !event.teamId) throw notFound("Match introuvable");
  const teamId = event.teamId;

  const [voterCallUp, nominee, nomineeCount] = await Promise.all([
    prisma.callUp.findUnique({ where: { userId_eventId: { userId: user.id, eventId: event.id } }, select: { status: true } }),
    prisma.teamMember.findFirst({
      where: { teamId, userId: nomineeId },
      select: { role: true, user: { select: { name: true, callUps: { where: { eventId: event.id }, select: { status: true } } } } },
    }),
    prisma.teamMember.count({ where: presentPlayersWhere(teamId, event.id) }),
  ]);
  const voterRole = membership.sections.find((section) => section.teamId === teamId)?.role;

  const error = motmVoteError({
    event,
    state: motmWindow(event.startDate).state,
    nomineeCount,
    voterId: user.id,
    nomineeId,
    voter: { sectionRole: voterRole === "COACH" || voterRole === "PLAYER" ? voterRole : null, callUpStatus: voterCallUp?.status ?? null },
    nominee: {
      sectionRole: nominee?.role === "COACH" || nominee?.role === "PLAYER" ? nominee.role : null,
      callUpStatus: nominee?.user.callUps[0]?.status ?? null,
    },
  });
  if (error) throw new AppError(error);

  await prisma.motmVote.upsert({
    where: { eventId_voterId: { eventId: event.id, voterId: user.id } },
    update: { nomineeId },
    create: { eventId: event.id, voterId: user.id, nomineeId },
  });
  return { message: `Vote enregistré pour ${nominee!.user.name}` };
});
