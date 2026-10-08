import type { AttendanceStatus, CallUpStatus, EventType } from "@/generated/prisma/browser";

type Player = { userId: string; name: string; email: string };

type ReminderEvent<P extends Player> = {
  type: EventType;
  /** Club-wide event: `players` are all the club members, there are no call-ups or attendances. */
  isClubEvent?: boolean;
  /** Extra fields (e.g. the email preference) are passed through to the recipients. */
  players: P[];
  attendances: { userId: string; status: AttendanceStatus }[];
  callUps: { userId: string; status: CallUpStatus }[];
};

/**
 * Who gets the reminder (pure function, tested):
 * - club-wide event: every club member (information only);
 * - match: called-up players who confirmed or have not answered yet;
 * - training: every player of the team except those who said they will be absent.
 */
export function reminderRecipients<P extends Player>(event: ReminderEvent<P>): (P & { action: string })[] {
  if (event.isClubEvent) {
    return event.players.map((player) => ({ ...player, action: "Événement du club : à demain !" }));
  }
  if (event.type === "TRAINING") {
    const absent = new Set(event.attendances.filter((a) => a.status === "ABSENT").map((a) => a.userId));
    return event.players
      .filter((player) => !absent.has(player.userId))
      .map((player) => ({ ...player, action: "Pense à indiquer ta présence si ce n'est pas déjà fait." }));
  }

  const callUps = new Map(event.callUps.map((callUp) => [callUp.userId, callUp.status]));
  return event.players.flatMap((player) => {
    const status = callUps.get(player.userId);
    if (status === "CONFIRMED") return [{ ...player, action: "Tu as confirmé ta présence : à demain !" }];
    if (status === "PENDING") return [{ ...player, action: "Tu n'as pas encore répondu à ta convocation." }];
    return [];
  });
}
