import { STATS_OPEN_AFTER_HOURS } from "@/features/stats/compute";

/**
 * Man of the match (pure rules, no I/O, tested in rules.test.ts).
 *
 * - Only a match of a section (league / cup, `teamId` set): never a training or a club-wide event.
 * - Window: the vote opens when the stats can be entered (kick-off + 3h) and stays open 48h.
 * - Present at the match = a PLAYER of the section with a CONFIRMED call-up. Present players are the
 *   nominees; voters are the present players + the coaches of the section.
 * - At least MOTM_MIN_NOMINEES present players, otherwise there is no vote.
 * - One vote per voter, never for yourself, changeable until the vote closes.
 * - Results (votes per player) stay hidden for everyone until the vote closes (only the turnout shows);
 *   ties = co-winners; no vote = no winner.
 */

export const MOTM_OPENS_AFTER_HOURS = STATS_OPEN_AFTER_HOURS;
export const MOTM_VOTE_HOURS = 48;
export const MOTM_MIN_NOMINEES = 2;

const HOUR = 3_600_000;

export type MotmState = "upcoming" | "open" | "closed";

export function motmWindow(startDate: Date, now = new Date()) {
  const opensAt = new Date(startDate.getTime() + MOTM_OPENS_AFTER_HOURS * HOUR);
  const closesAt = new Date(opensAt.getTime() + MOTM_VOTE_HOURS * HOUR);
  const state: MotmState = now < opensAt ? "upcoming" : now < closesAt ? "open" : "closed";
  return { opensAt, closesAt, state };
}

/** Matches whose vote is closed started before this date. */
export const motmClosedBefore = (now = new Date()) =>
  new Date(now.getTime() - (MOTM_OPENS_AFTER_HOURS + MOTM_VOTE_HOURS) * HOUR);

/** Matches whose vote is open started in [from, to]. */
export const motmOpenRange = (now = new Date()) => ({
  from: new Date(motmClosedBefore(now).getTime() + 1),
  to: new Date(now.getTime() - MOTM_OPENS_AFTER_HOURS * HOUR),
});

type EventKind = { type: "TRAINING" | "LEAGUE" | "CUP"; teamId: string | null };

/** Only matches of a section have a man of the match. */
export const hasMotm = (event: EventKind) => event.type !== "TRAINING" && event.teamId !== null;

type Presence = { sectionRole: "COACH" | "PLAYER" | null; callUpStatus: string | null };

export const isMotmNominee = ({ sectionRole, callUpStatus }: Presence) => sectionRole === "PLAYER" && callUpStatus === "CONFIRMED";

export const isMotmVoter = (presence: Presence) => presence.sectionRole === "COACH" || isMotmNominee(presence);

/** Returns the message to show, or null when the vote can be recorded. */
export function motmVoteError(input: {
  event: EventKind;
  state: MotmState;
  nomineeCount: number;
  voterId: string;
  nomineeId: string;
  voter: Presence;
  nominee: Presence;
}) {
  if (!hasMotm(input.event)) return "Il n'y a pas d'homme du match pour cet événement";
  if (input.nomineeCount < MOTM_MIN_NOMINEES) return "Pas assez de joueurs présents pour voter";
  if (input.state === "upcoming") return "Le vote n'est pas encore ouvert";
  if (input.state === "closed") return "Le vote est terminé";
  if (!isMotmVoter(input.voter)) return "Seuls les joueurs présents au match et les coachs votent";
  if (input.voterId === input.nomineeId) return "Tu ne peux pas voter pour toi";
  if (!isMotmNominee(input.nominee)) return "Ce joueur n'était pas présent au match";
  return null;
}

export type MotmTally = { eventId: string; nomineeId: string; votes: number };

/** Winners of one match: every nominee with the most votes (co-winners on a tie), none without votes. */
export function motmWinners(tallies: { nomineeId: string; votes: number }[]) {
  const best = Math.max(0, ...tallies.map((tally) => tally.votes));
  return { votes: best, winnerIds: best > 0 ? tallies.filter((tally) => tally.votes === best).map((tally) => tally.nomineeId) : [] };
}

/** Man-of-the-match awards per player over several (closed) matches. */
export function motmAwardsByUser(tallies: MotmTally[]) {
  const byEvent = new Map<string, MotmTally[]>();
  for (const tally of tallies) byEvent.set(tally.eventId, [...(byEvent.get(tally.eventId) ?? []), tally]);
  const awards = new Map<string, number>();
  for (const eventTallies of byEvent.values()) {
    for (const userId of motmWinners(eventTallies).winnerIds) awards.set(userId, (awards.get(userId) ?? 0) + 1);
  }
  return awards;
}
