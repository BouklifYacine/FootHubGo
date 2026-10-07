import { prisma } from "@/prisma";
import { notFound } from "@/lib/errors";
import { cancelCallUpError, injuriesOnDay, replyCallUpError, sendCallUpError } from "./rules";

/**
 * Players of the team for a match, with their injury status on match day.
 * Call-up details (status, dates) are only returned to the coach.
 */
export async function getEventCallUps(eventId: string, teamId: string, isCoach: boolean) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, teamId },
    select: { id: true, startDate: true },
  });
  if (!event) throw notFound("Événement introuvable");

  const players = await prisma.teamMember.findMany({
    where: { teamId, role: "PLAYER" },
    orderBy: { user: { name: "asc" } },
    select: {
      isLicensed: true,
      position: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          injuries: { where: injuriesOnDay(event.startDate), select: { id: true } },
          callUps: {
            where: { eventId: event.id },
            select: { id: true, status: true, sentAt: true, respondedAt: true },
          },
        },
      },
    },
  });

  return {
    canSend: isCoach && sendCallUpError(event.startDate) === null,
    canCancel: isCoach && cancelCallUpError(event.startDate) === null,
    players: players.map(({ user, ...member }) => ({
      ...member,
      userId: user.id,
      name: user.name,
      image: user.image,
      isInjured: user.injuries.length > 0,
      callUp: isCoach ? (user.callUps[0] ?? null) : null,
    })),
  };
}

/** The caller's call-ups: upcoming first (soonest first), then past ones (latest first). */
export async function listMyCallUps(userId: string) {
  const now = new Date();
  const callUps = await prisma.callUp.findMany({
    where: { userId },
    orderBy: { event: { startDate: "asc" } },
    select: {
      id: true,
      status: true,
      sentAt: true,
      respondedAt: true,
      event: {
        select: { id: true, title: true, type: true, startDate: true, location: true, opponent: true },
      },
    },
  });

  const upcoming = callUps.filter((callUp) => callUp.event.startDate >= now);
  const past = callUps.filter((callUp) => callUp.event.startDate < now).reverse();

  return {
    stats: {
      total: callUps.length,
      past: past.length,
      confirmed: callUps.filter((callUp) => callUp.status === "CONFIRMED").length,
      declined: callUps.filter((callUp) => callUp.status === "DECLINED").length,
    },
    callUps: [...upcoming, ...past].map((callUp) => ({
      ...callUp,
      // A pending call-up can no longer be answered 3h before the match
      isExpired: callUp.status === "PENDING" && replyCallUpError(callUp.event.startDate, now) !== null,
    })),
  };
}
