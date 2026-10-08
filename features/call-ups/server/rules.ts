import { differenceInMinutes, endOfDay, startOfDay } from "date-fns";

/**
 * Time rules of call-ups, as pure functions (easy to test, no DB).
 * Each `*Error` function returns the message to show, or null when the action is allowed.
 */
export const CALL_UP_RULES = {
  /** A coach must send a call-up at least 24h before the match. */
  sendMinHours: 24,
  /** A coach can cancel a call-up until 6h before the match. */
  cancelMinHours: 6,
  /** A player can answer until 3h before the match. */
  replyMinHours: 3,
} as const;

const hoursUntil = (date: Date, now: Date) => differenceInMinutes(date, now) / 60;

export function sendCallUpError(eventStart: Date, now = new Date()) {
  if (eventStart <= now) return "L'événement est déjà passé";
  if (hoursUntil(eventStart, now) < CALL_UP_RULES.sendMinHours) {
    return `La convocation doit être envoyée au moins ${CALL_UP_RULES.sendMinHours}h avant le match`;
  }
  return null;
}

export function cancelCallUpError(eventStart: Date, now = new Date()) {
  if (eventStart <= now) return "L'événement est déjà passé";
  if (hoursUntil(eventStart, now) < CALL_UP_RULES.cancelMinHours) {
    return `Une convocation ne peut plus être annulée moins de ${CALL_UP_RULES.cancelMinHours}h avant le match`;
  }
  return null;
}

export function replyCallUpError(eventStart: Date, now = new Date()) {
  if (eventStart <= now) return "L'événement est déjà passé";
  if (hoursUntil(eventStart, now) < CALL_UP_RULES.replyMinHours) {
    return `Tu dois répondre au moins ${CALL_UP_RULES.replyMinHours}h avant le match`;
  }
  return null;
}

/**
 * What the player can still do with their call-up: answer, or change their answer, until
 * `replyMinHours` before the match (an EXPIRED call-up is closed).
 */
export function callUpAnswerState(status: "PENDING" | "CONFIRMED" | "DECLINED" | "EXPIRED", eventStart: Date, now = new Date()) {
  const deadline = new Date(eventStart.getTime() - CALL_UP_RULES.replyMinHours * 3_600_000);
  return { canReply: status !== "EXPIRED" && replyCallUpError(eventStart, now) === null, deadline };
}

/** True if one of the injuries covers the day of the event. */
export function isInjuredOn(injuries: { startDate: Date; endDate: Date }[], eventStart: Date) {
  const dayStart = startOfDay(eventStart);
  const dayEnd = endOfDay(eventStart);
  return injuries.some((injury) => injury.startDate <= dayEnd && injury.endDate >= dayStart);
}

/** Prisma filter matching the injuries that cover the day of the event (same rule as `isInjuredOn`). */
export function injuriesOnDay(eventStart: Date) {
  return { startDate: { lte: endOfDay(eventStart) }, endDate: { gte: startOfDay(eventStart) } };
}
