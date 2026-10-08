import { addHours } from "date-fns";
import type { MatchResult } from "@/generated/prisma/browser";

/**
 * Pure stats computations (no I/O): used by `server/queries.ts` and the actions,
 * and easy to unit test.
 */

/** Stats can be entered 3 h after kick-off and edited until 48 h after it. */
export const STATS_OPEN_AFTER_HOURS = 3;
export const STATS_LOCKED_AFTER_HOURS = 48;

export function getStatsWindow(startDate: Date, now = new Date()) {
  return {
    isOpen: now >= addHours(startDate, STATS_OPEN_AFTER_HOURS),
    isEditable: now <= addHours(startDate, STATS_LOCKED_AFTER_HOURS),
  };
}

const ratio = (part: number, total: number) => (total > 0 ? part / total : 0);
const round = (value: number, digits = 2) => Number(value.toFixed(digits));
const percent = (part: number, total: number) => round(ratio(part, total) * 100, 1);

export const pointsFor = (result: MatchResult) => (result === "WIN" ? 3 : result === "DRAW" ? 1 : 0);

type TeamMatch = {
  result: MatchResult;
  goalsFor: number;
  goalsAgainst: number;
  isHome: boolean;
};

export function summarizeTeamStats(matches: TeamMatch[]) {
  const home = matches.filter((match) => match.isHome);
  const away = matches.filter((match) => !match.isHome);
  const count = (list: TeamMatch[], result: MatchResult) =>
    list.filter((match) => match.result === result).length;
  const sum = (list: TeamMatch[], key: "goalsFor" | "goalsAgainst") =>
    list.reduce((total, match) => total + match[key], 0);
  const points = (list: TeamMatch[]) => list.reduce((total, match) => total + pointsFor(match.result), 0);
  const goalDifference = (list: TeamMatch[]) => sum(list, "goalsFor") - sum(list, "goalsAgainst");

  const played = matches.length;
  const wins = count(matches, "WIN");
  const cleanSheets = matches.filter((match) => match.goalsAgainst === 0).length;

  return {
    matches: played,
    wins,
    draws: count(matches, "DRAW"),
    losses: count(matches, "LOSS"),
    points: points(matches),
    goalsFor: sum(matches, "goalsFor"),
    goalsAgainst: sum(matches, "goalsAgainst"),
    goalDifference: goalDifference(matches),
    winRate: percent(wins, played),
    cleanSheets,
    cleanSheetRate: percent(cleanSheets, played),
    avgGoalsFor: round(ratio(sum(matches, "goalsFor"), played)),
    avgGoalsAgainst: round(ratio(sum(matches, "goalsAgainst"), played)),
    homeWins: count(home, "WIN"),
    homeLosses: count(home, "LOSS"),
    homeWinRate: percent(count(home, "WIN"), home.length),
    homeGoalDifference: goalDifference(home),
    homeAvgPoints: round(ratio(points(home), home.length)),
    awayGoalDifference: goalDifference(away),
    awayAvgPoints: round(ratio(points(away), away.length)),
  };
}

export type TeamStatsSummary = ReturnType<typeof summarizeTeamStats>;

type PlayerMatch = {
  goals: number;
  assists: number;
  /** null = not rated (left out of the average). */
  rating: number | null;
  minutesPlayed: number;
  isStarter: boolean;
};

export function summarizePlayerStats(matches: PlayerMatch[]) {
  const sum = (key: "goals" | "assists" | "minutesPlayed") =>
    matches.reduce((total, match) => total + match[key], 0);

  const played = matches.length;
  const goals = sum("goals");
  const assists = sum("assists");
  const minutes = sum("minutesPlayed");
  const rated = matches.flatMap((match) => (match.rating === null ? [] : [match.rating]));
  const withMinutes = matches.filter((match) => match.minutesPlayed > 0).length;
  const starts = matches.filter((match) => match.isStarter).length;
  const per90 = (value: number) => round(ratio(value, minutes) * 90);

  return {
    matches: played,
    goals,
    assists,
    goalContributions: goals + assists,
    avgRating: round(ratio(rated.reduce((total, rating) => total + rating, 0), rated.length), 1),
    minutes,
    /** Average over the matches actually played (minutes > 0). */
    avgMinutes: Math.round(ratio(minutes, withMinutes)),
    starts,
    startRate: percent(starts, played),
    goalsPerMatch: round(ratio(goals, played)),
    assistsPerMatch: round(ratio(assists, played)),
    goalsPer90: per90(goals),
    assistsPer90: per90(assists),
    contributionsPer90: per90(goals + assists),
  };
}

export type PlayerStatsSummary = ReturnType<typeof summarizePlayerStats>;

export type Standing = {
  team: { id: string; name: string; logoUrl: string | null };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  /** Most recent first. */
  recentForm: MatchResult[];
};

export function buildStanding(
  team: Standing["team"],
  totals: { wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number },
  recentForm: MatchResult[],
): Standing {
  return {
    team,
    ...totals,
    played: totals.wins + totals.draws + totals.losses,
    points: totals.wins * 3 + totals.draws,
    goalDifference: totals.goalsFor - totals.goalsAgainst,
    recentForm,
  };
}

/** Points first, then goal difference. */
export const compareStandings = (a: Standing, b: Standing) =>
  b.points - a.points || b.goalDifference - a.goalDifference;
