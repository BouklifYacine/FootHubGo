"use server";

import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { requireCoach, requireMember } from "@/lib/auth/session";
import { AppError, notFound } from "@/lib/errors";
import { notifyUsers } from "@/features/notifications/server/notify-user";
import { voteError } from "./rules";
import { createPollSchema, pollIdSchema, voteSchema } from "./schemas";

/** A poll of the caller's team (ids from the client are never trusted alone). */
async function findTeamPoll(pollId: string, teamId: string) {
  const poll = await prisma.poll.findFirst({
    where: { id: pollId, teamId },
    select: { id: true, options: true, isMulti: true, expiresAt: true },
  });
  if (!poll) throw notFound("Sondage introuvable");
  return poll;
}

/** Each poll notifies the whole team: 20 per hour per coach. */
const pollBudget = rateLimiter("polls", { max: 20, windowMs: 60 * 60_000 });

export const createPoll = action(createPollSchema, async ({ question, options, isMulti, expiresAt }) => {
  const { user, membership } = await requireCoach();
  enforceRateLimit([[pollBudget, user.id]], "Trop de sondages créés. Réessayez plus tard.");
  await prisma.poll.create({
    data: { question, options, isMulti, expiresAt, creatorId: user.id, teamId: membership.teamId },
  });

  const members = await prisma.teamMember.findMany({
    where: { teamId: membership.teamId, userId: { not: user.id } },
    select: { userId: true },
  });
  await notifyUsers(
    members.map((m) => m.userId),
    { type: "NEW_POLL", title: "Nouveau sondage", message: question, fromUserName: user.name, fromUserImage: user.image, url: "/app/polls" },
  );
  return { message: "Sondage publié" };
});

/** Replaces the caller's choices in one transaction (changing a vote is allowed until the end date). */
export const vote = action(voteSchema, async ({ pollId, choices }) => {
  const { user, membership } = await requireMember();
  const poll = await findTeamPoll(pollId, membership.teamId);
  const error = voteError(poll, choices);
  if (error) throw new AppError(error);

  await prisma.$transaction([
    prisma.pollResponse.deleteMany({ where: { pollId: poll.id, userId: user.id } }),
    prisma.pollResponse.createMany({
      data: choices.map((choice) => ({ pollId: poll.id, userId: user.id, choice })),
      skipDuplicates: true,
    }),
  ]);
  return { message: choices.length > 0 ? "Vote enregistré" : "Vote retiré" };
});

export const closePoll = action(pollIdSchema, async (pollId) => {
  const { membership } = await requireCoach();
  const poll = await findTeamPoll(pollId, membership.teamId);
  await prisma.poll.update({ where: { id: poll.id }, data: { expiresAt: new Date() } });
  return { message: "Sondage clôturé" };
});

export const deletePoll = action(pollIdSchema, async (pollId) => {
  const { membership } = await requireCoach();
  const poll = await findTeamPoll(pollId, membership.teamId);
  await prisma.poll.delete({ where: { id: poll.id } });
  return { message: "Sondage supprimé" };
});
