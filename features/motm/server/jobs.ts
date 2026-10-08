import { prisma } from "@/prisma";
import { formatDateTime } from "@/lib/format";
import { TEAM_TIME_ZONE } from "@/features/events/recurrence";
import { notifyUser, notifyUsers } from "@/features/notifications/server/notify-user";
import { MOTM_MIN_NOMINEES, motmClosedBefore, motmOpenRange, motmWindow, motmWinners } from "../rules";
import { getMotmTallies, presentPlayersWhere } from "./queries";

const matchWhere = { type: { in: ["LEAGUE" as const, "CUP" as const] }, teamId: { not: null } };
const eventUrl = (eventId: string) => `/app/events/${eventId}`;

/**
 * Opens the man-of-the-match votes that are due: notifies the voters (present players + coaches) once.
 * Each match is claimed with a conditional update first (idempotent, safe with several instances).
 */
export async function openDueMotmVotes(now = new Date()) {
  const { from, to } = motmOpenRange(now);
  const events = await prisma.event.findMany({
    where: { ...matchWhere, motmOpenNotifiedAt: null, startDate: { gte: from, lte: to } },
    select: { id: true, title: true, opponent: true, teamId: true, startDate: true },
    take: 50,
  });

  let notified = 0;
  for (const event of events) {
    const { count } = await prisma.event.updateMany({ where: { id: event.id, motmOpenNotifiedAt: null }, data: { motmOpenNotifiedAt: now } });
    if (count === 0 || !event.teamId) continue;

    const [players, coaches] = await Promise.all([
      prisma.teamMember.findMany({ where: presentPlayersWhere(event.teamId, event.id), select: { userId: true } }),
      prisma.teamMember.findMany({ where: { teamId: event.teamId, role: "COACH" }, select: { userId: true } }),
    ]);
    if (players.length < MOTM_MIN_NOMINEES) continue;

    const voters = [...players, ...coaches].map((member) => member.userId);
    const closesAt = motmWindow(event.startDate, now).closesAt;
    await notifyUsers(voters, {
      type: "MAN_OF_THE_MATCH",
      title: "Homme du match",
      message: `Vote pour l'homme du match ${event.opponent ? `contre ${event.opponent}` : `: ${event.title}`} avant ${formatDateTime(closesAt, { timeZone: TEAM_TIME_ZONE })}.`,
      url: eventUrl(event.id),
    });
    notified += voters.length;
  }
  return { events: events.length, notified };
}

/** Closes the votes that are over: the winner(s) are notified once (claimed like the opening). */
export async function closeDueMotmVotes(now = new Date()) {
  const events = await prisma.event.findMany({
    where: { ...matchWhere, motmClosedAt: null, startDate: { lt: motmClosedBefore(now) } },
    select: { id: true, title: true, opponent: true },
    take: 50,
  });

  let winners = 0;
  for (const event of events) {
    const { count } = await prisma.event.updateMany({ where: { id: event.id, motmClosedAt: null }, data: { motmClosedAt: now } });
    if (count === 0) continue;

    const result = motmWinners(await getMotmTallies({ eventId: event.id }));
    const shared = result.winnerIds.length > 1;
    for (const userId of result.winnerIds) {
      await notifyUser({
        userId,
        type: "MAN_OF_THE_MATCH",
        title: shared ? "Co-homme du match !" : "Tu es l'homme du match !",
        message: `${result.votes} vote${result.votes > 1 ? "s" : ""} de tes coéquipiers ${event.opponent ? `contre ${event.opponent}` : `: ${event.title}`}. Bravo !`,
        url: eventUrl(event.id),
      });
    }
    winners += result.winnerIds.length;
  }
  return { events: events.length, winners };
}
