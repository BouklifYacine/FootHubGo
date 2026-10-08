/**
 * Playing time rules (pure, no I/O): the coach's playing-time sheet of a match and the season totals.
 *
 * - Minutes are 0..MAX_MINUTES (90 + extra time of a cup match + stoppage time).
 * - Only the players present at the match can get minutes: a CONFIRMED call-up ("eligible").
 * - 0 minutes = did not play = no stats row (an existing row without goal / assist is removed).
 * - A starter played (> 0 minutes); at most MAX_STARTERS starters.
 */

export const MAX_MINUTES = 130;
export const MAX_STARTERS = 11;
/** One tap values of the sheet. */
export const MINUTE_PRESETS = [90, 75, 60, 45, 30, 15] as const;
export const STARTER_DEFAULT_MINUTES = 90;
export const SUBSTITUTE_DEFAULT_MINUTES = 30;

export type PlayingTimeEntry = { userId: string; minutes: number; isStarter: boolean };

export function minutesError(minutes: number) {
  if (!Number.isInteger(minutes)) return "Les minutes sont un nombre entier";
  if (minutes < 0) return "Minimum 0 minute";
  if (minutes > MAX_MINUTES) return `Maximum ${MAX_MINUTES} minutes (prolongations comprises)`;
  return null;
}

/**
 * The whole sheet: returns the message to show, or null when it can be saved. The sheet may list only
 * some players: `savedStarterIds` (starters already saved) count too unless the sheet changes them.
 */
export function playingTimeError(
  entries: PlayingTimeEntry[],
  eligibleUserIds: Iterable<string>,
  savedStarterIds: Iterable<string> = [],
) {
  const eligible = new Set(eligibleUserIds);
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.userId)) return "Un joueur apparaît deux fois";
    seen.add(entry.userId);
    if (!eligible.has(entry.userId)) return "Seuls les joueurs présents (convocation confirmée) ont du temps de jeu";
    const error = minutesError(entry.minutes);
    if (error) return error;
    if (entry.isStarter && entry.minutes === 0) return "Un titulaire a forcément joué : indique ses minutes";
  }
  const keptStarters = [...new Set(savedStarterIds)].filter((userId) => !seen.has(userId)).length;
  if (entries.filter((entry) => entry.isStarter).length + keptStarters > MAX_STARTERS) {
    return `${MAX_STARTERS} titulaires maximum`;
  }
  return null;
}

type ExistingRow = { id: string; userId: string; goals: number; assists: number };

/**
 * What the sheet changes: rows to create / update (minutes > 0) and rows to delete (back to 0).
 * A player who scored or assisted keeps their row: setting them to 0 is an error.
 */
export function playingTimeChanges(entries: PlayingTimeEntry[], existing: ExistingRow[]) {
  const byUser = new Map(existing.map((row) => [row.userId, row]));
  const upserts: (PlayingTimeEntry & { statId: string | null })[] = [];
  const deletes: string[] = [];
  for (const entry of entries) {
    const row = byUser.get(entry.userId);
    if (entry.minutes > 0) upserts.push({ ...entry, statId: row?.id ?? null });
    else if (row) {
      if (row.goals > 0 || row.assists > 0) {
        return { error: "Un joueur qui a marqué ou fait une passe décisive a joué : indique ses minutes" } as const;
      }
      deletes.push(row.id);
    }
  }
  return { error: null, upserts, deletes } as const;
}

export type PlayingTimeRow = { userId: string; minutesPlayed: number; isStarter: boolean };

/** Season playing time per player: most minutes first. `matches` counts the matches actually played. */
export function summarizePlayingTime(rows: PlayingTimeRow[]) {
  const byUser = new Map<string, { userId: string; matches: number; minutes: number; starts: number }>();
  for (const row of rows) {
    const total = byUser.get(row.userId) ?? { userId: row.userId, matches: 0, minutes: 0, starts: 0 };
    if (row.minutesPlayed > 0) total.matches += 1;
    total.minutes += row.minutesPlayed;
    if (row.isStarter) total.starts += 1;
    byUser.set(row.userId, total);
  }
  return [...byUser.values()]
    .map((total) => ({ ...total, avgMinutes: total.matches ? Math.round(total.minutes / total.matches) : 0 }))
    .sort((a, b) => b.minutes - a.minutes || b.matches - a.matches);
}
