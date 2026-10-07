import { prisma } from "@/prisma";

/** True once the poll has passed its end date (closing a poll sets it to now). */
export const isPollClosed = (poll: { expiresAt: Date | null }, now = new Date()) =>
  poll.expiresAt !== null && poll.expiresAt <= now;

/**
 * Polls of a team, newest first, with the results. Votes are nominative:
 * every member sees who chose each option (team polls like "available on Saturday?").
 */
export async function listPolls(teamId: string, userId: string) {
  const polls = await prisma.poll.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      question: true,
      options: true,
      isMulti: true,
      expiresAt: true,
      createdAt: true,
      creator: { select: { name: true } },
      responses: { select: { choice: true, userId: true, user: { select: { name: true } } } },
    },
  });

  return polls.map(({ responses, options, creator, ...poll }) => ({
    ...poll,
    creatorName: creator.name,
    isClosed: isPollClosed(poll),
    voterCount: new Set(responses.map((r) => r.userId)).size,
    myChoices: responses.filter((r) => r.userId === userId).map((r) => r.choice),
    results: options.map((option) => {
      const voters = responses.filter((r) => r.choice === option).map((r) => r.user.name);
      return { option, count: voters.length, voters };
    }),
  }));
}
