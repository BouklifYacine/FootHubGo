import { createElement } from "react";
import { prisma } from "@/prisma";
import { EventReminderEmail } from "@/emails/event-reminder-email";
import { sendEmail } from "@/emails/send-email";
import { notifyUser } from "@/features/notifications/server/notify-user";
import {
  createUnsubscribeToken,
  listUnsubscribeHeaders,
  unsubscribePageUrl,
} from "@/features/notifications/unsubscribe";
import { appSecret } from "@/lib/signed-token";
import { TEAM_TIME_ZONE } from "../recurrence";
import { reminderRecipients } from "../reminder-recipients";

/** The reminder goes out the day before (checked every few minutes by server/jobs.ts). */
export const REMINDER_HOURS_BEFORE = 24;

const formatWhen = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: TEAM_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

/**
 * Sends the reminders of the events starting within the next 24h.
 * Each event is claimed with a conditional update first, so a reminder is never sent twice
 * (even with several server instances or overlapping runs).
 */
export async function sendDueReminders(now = new Date()) {
  const events = await prisma.event.findMany({
    where: {
      reminderSentAt: null,
      startDate: { gt: now, lte: new Date(now.getTime() + REMINDER_HOURS_BEFORE * 3600 * 1000) },
    },
    orderBy: { startDate: "asc" },
    take: 50,
    select: {
      id: true,
      title: true,
      type: true,
      startDate: true,
      location: true,
      team: {
        select: {
          members: {
            where: { role: "PLAYER" },
            select: { userId: true, user: { select: { name: true, email: true, emailReminders: true } } },
          },
        },
      },
      // Club-wide events (no section) remind every club member.
      club: {
        select: {
          members: { select: { userId: true, user: { select: { name: true, email: true, emailReminders: true } } } },
        },
      },
      attendances: { select: { userId: true, status: true } },
      callUps: { select: { userId: true, status: true } },
    },
  });

  const appUrl = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  let sent = 0;

  for (const event of events) {
    const { count } = await prisma.event.updateMany({
      where: { id: event.id, reminderSentAt: null },
      data: { reminderSentAt: now },
    });
    if (count === 0) continue; // already claimed by another run

    const recipients = reminderRecipients({
      type: event.type,
      isClubEvent: event.team === null,
      players: (event.team ?? event.club).members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        emailReminders: m.user.emailReminders,
      })),
      attendances: event.attendances,
      callUps: event.callUps,
    });
    const when = formatWhen(event.startDate);
    const url = `${appUrl}/app/events/${event.id}`;

    // One failing recipient must not stop the others. The in-app notification always goes out,
    // the email only to players who kept the reminder emails on.
    await Promise.allSettled(
      recipients.flatMap((r) => {
        const token = createUnsubscribeToken(r.userId, appSecret());
        return [
          notifyUser({
            userId: r.userId,
            type: "EVENT_REMINDER",
            title: `Rappel : ${event.title}`,
            message: `${when}. ${r.action}`,
          }),
          ...(r.emailReminders
            ? [
                sendEmail({
                  to: r.email,
                  subject: `Rappel : ${event.title} ${when}`,
                  headers: listUnsubscribeHeaders(appUrl, token),
                  email: createElement(EventReminderEmail, {
                    name: r.name,
                    title: event.title,
                    when,
                    location: event.location,
                    action: r.action,
                    url,
                    unsubscribeUrl: unsubscribePageUrl(appUrl, token),
                  }),
                }),
              ]
            : []),
        ];
      }),
    );
    sent += recipients.length;
  }

  return { events: events.length, recipients: sent };
}
