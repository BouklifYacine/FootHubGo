/**
 * The ONE place where dates are formatted for the UI (French). Pure functions built on `Intl`:
 * in the browser they use the device time zone; server code (notifications, emails) passes
 * `TEAM_TIME_ZONE` (features/events/recurrence.ts).
 *
 *   formatDate(d)          "sam. 12 oct."          (+ year when it is not the current one)
 *   formatDateLong(d)      "samedi 12 octobre"
 *   formatTime(d)          "15h00"
 *   formatDateTime(d)      "sam. 12 oct. à 15h00"
 *   formatNumericDate(d)   "12/10/2026"
 *   formatRelative(d)      "il y a 5 min", "dans 2 jours"
 *   formatDayLabel(d)      "Aujourd'hui", "Demain", "Hier" or formatDate(d)
 */
type DateInput = Date | string | number;
type Options = { timeZone?: string; now?: Date };

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value));

function parts(value: DateInput, options: Intl.DateTimeFormatOptions, timeZone?: string) {
  const formatted = new Intl.DateTimeFormat("fr-FR", { ...options, timeZone }).formatToParts(toDate(value));
  return Object.fromEntries(formatted.map((part) => [part.type, part.value])) as Record<Intl.DateTimeFormatPartTypes, string>;
}

/** Calendar day key (YYYY-MM-DD) in the given time zone, to compare days. */
export function dayKey(value: DateInput, timeZone?: string) {
  const { year, month, day } = parts(value, { year: "numeric", month: "2-digit", day: "2-digit" }, timeZone);
  return `${year}-${month}-${day}`;
}

/** "sam. 12 oct." (the year is added when it differs from the current one). */
export function formatDate(value: DateInput, { timeZone, now = new Date() }: Options = {}) {
  const sameYear = parts(value, { year: "numeric" }, timeZone).year === parts(now, { year: "numeric" }, timeZone).year;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
    timeZone,
  }).format(toDate(value));
}

/** "samedi 12 octobre" (+ year when it is not the current one). */
export function formatDateLong(value: DateInput, { timeZone, now = new Date() }: Options = {}) {
  const sameYear = parts(value, { year: "numeric" }, timeZone).year === parts(now, { year: "numeric" }, timeZone).year;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: sameYear ? undefined : "numeric",
    timeZone,
  }).format(toDate(value));
}

/** "15h00". */
export function formatTime(value: DateInput, { timeZone }: Options = {}) {
  const { hour, minute } = parts(value, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }, timeZone);
  return `${hour}h${minute}`;
}

/** "sam. 12 oct. à 15h00". */
export function formatDateTime(value: DateInput, options: Options = {}) {
  return `${formatDate(value, options)} à ${formatTime(value, options)}`;
}

/** "12/10/2026": tables and compact lists. */
export function formatNumericDate(value: DateInput, { timeZone }: Options = {}) {
  const { day, month, year } = parts(value, { day: "2-digit", month: "2-digit", year: "numeric" }, timeZone);
  return `${day}/${month}/${year}`;
}

/** "Aujourd'hui", "Demain", "Hier", otherwise formatDate(). */
export function formatDayLabel(value: DateInput, { timeZone, now = new Date() }: Options = {}) {
  const day = dayKey(value, timeZone);
  const offset = (days: number) => dayKey(now.getTime() + days * 86_400_000, timeZone);
  if (day === offset(0)) return "Aujourd'hui";
  if (day === offset(1)) return "Demain";
  if (day === offset(-1)) return "Hier";
  return formatDate(value, { timeZone, now });
}

const relative = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86_400],
  ["month", 30 * 86_400],
  ["week", 7 * 86_400],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "il y a 5 minutes", "dans 2 jours", "à l'instant". */
export function formatRelative(value: DateInput, { now = new Date() }: Options = {}) {
  const seconds = Math.round((toDate(value).getTime() - now.getTime()) / 1000);
  if (Math.abs(seconds) < 45) return "à l'instant";
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size || unit === "minute") return relative.format(Math.round(seconds / size), unit);
  }
  return relative.format(seconds, "second");
}
