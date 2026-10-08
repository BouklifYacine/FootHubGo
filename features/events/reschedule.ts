/**
 * What moving an event to another start date changes. The jobs remember what they already did
 * (`reminderSentAt`, `motmOpenNotifiedAt`, `motmClosedAt`): a moved event must start from scratch,
 * so its reminder goes out again before the new date. Once the man-of-the-match vote has started,
 * the date is part of the result and can no longer change.
 */
export function rescheduleOutcome(
  event: { startDate: Date; motmOpenNotifiedAt: Date | null; motmClosedAt: Date | null; motmVoteCount: number },
  newStartDate: Date,
): { error: string } | { reset: { reminderSentAt: null; motmOpenNotifiedAt: null; motmClosedAt: null } | null } {
  if (event.startDate.getTime() === newStartDate.getTime()) return { reset: null };
  if (event.motmOpenNotifiedAt || event.motmClosedAt || event.motmVoteCount > 0) {
    return { error: "Le vote de l'homme du match a déjà eu lieu : la date de ce match ne peut plus changer" };
  }
  return { reset: { reminderSentAt: null, motmOpenNotifiedAt: null, motmClosedAt: null } };
}
