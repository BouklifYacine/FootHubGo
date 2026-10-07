import type { AttendanceStatus, CallUpStatus, EventType } from "@/generated/prisma/browser";

type Recipient = { userId: string; name: string; email: string; action: string };

type ReminderEvent = {
  type: EventType;
  players: { userId: string; name: string; email: string }[];
  attendances: { userId: string; status: AttendanceStatus }[];
  callUps: { userId: string; status: CallUpStatus }[];
};

/**
 * Who gets the reminder (pure function, tested):
 * - match: called-up players who confirmed or have not answered yet;
 * - training: every player of the team except those who said they will be absent.
 */
export function reminderRecipients(event: ReminderEvent): Recipient[] {
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
