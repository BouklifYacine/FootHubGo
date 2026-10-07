import { Temporal } from "temporal-polyfill";

/** Teams are French: weekly repetitions keep the same wall-clock time in this zone (DST included). */
export const TEAM_TIME_ZONE = "Europe/Paris";
/** One season at most. */
export const MAX_OCCURRENCES = 52;

/**
 * Every week from `start` until the day of `until` (included), at the same local time:
 * a training on Tuesdays at 19:00 stays at 19:00 after the switch to summer / winter time.
 */
export function weeklyOccurrences(start: Date, until: Date, timeZone = TEAM_TIME_ZONE): Date[] {
  const toZoned = (date: Date) => Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(timeZone);
  const lastDay = toZoned(until).toPlainDate();

  const dates: Date[] = [];
  for (
    let occurrence = toZoned(start);
    Temporal.PlainDate.compare(occurrence.toPlainDate(), lastDay) <= 0 && dates.length < MAX_OCCURRENCES;
    occurrence = occurrence.add({ weeks: 1 })
  ) {
    dates.push(new Date(occurrence.epochMilliseconds));
  }
  return dates;
}
