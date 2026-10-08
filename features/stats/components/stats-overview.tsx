"use client";

import { useMyTeam, type MyTeam } from "@/features/team/hooks/use-my-team";
import { useProfile } from "@/features/settings/hooks/use-profile";
import { usePlayerStats } from "../hooks/use-player-stats";
import { useTeamStats } from "../hooks/use-team-stats";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { Page, PageHeader } from "@/components/app/page-header";
import { normalize, StatList, StatsHeader, StatsRadar, StatsSkeleton } from "./stats-display";
import { TeamPlayingTime } from "./team-playing-time";

type Team = NonNullable<MyTeam["team"]>;

const layout = "grid items-start gap-6 lg:grid-cols-3";

/** /app/stats: the team's season for the coach, the player's own season for a player. */
export function StatsOverview() {
  const { data: myTeam, isLoading } = useMyTeam();

  if (isLoading) return <StatsSkeleton />;
  if (!myTeam?.team) return null;
  const isPlayer = myTeam.role === "PLAYER";

  return (
    <Page>
      <PageHeader
        title="Statistiques"
        description={isPlayer ? "Ta saison, match après match." : `La saison de ${myTeam.team.displayName}.`}
      />
      {isPlayer ? <PlayerStatsView team={myTeam.team} /> : <TeamStatsView team={myTeam.team} />}
    </Page>
  );
}

function TeamStatsView({ team }: { team: Team }) {
  const { data: stats, isLoading, error, refetch } = useTeamStats(team.id);
  const { data: profile } = useProfile();

  if (isLoading) return <StatsSkeleton />;
  if (error || !stats) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className={layout}>
      <StatsHeader
        name={team.name}
        image={team.logoUrl}
        caption={{ name: profile?.name ?? "", image: profile?.image }}
        highlights={[
          { label: "Matchs", value: stats.matches },
          { label: "Victoires", value: stats.wins },
          { label: "Défaites", value: stats.losses },
        ]}
      />
      <StatsRadar
        title="Statistiques de l'équipe"
        data={[
          { subject: "Taux victoires", value: normalize(stats.winRate, 100), label: `${stats.winRate}%` },
          {
            subject: "Points / match extérieur",
            value: normalize(stats.awayAvgPoints, 3),
            label: `${stats.awayAvgPoints} pts (max 3)`,
          },
          { subject: "Buts / match", value: normalize(stats.avgGoalsFor, 5), label: `${stats.avgGoalsFor}` },
          { subject: "Clean sheets", value: normalize(stats.cleanSheetRate, 100), label: `${stats.cleanSheetRate}%` },
          {
            subject: "Défense",
            // Fewer goals conceded = better: 0 conceded per match fills the axis
            value: normalize(3.5 - stats.avgGoalsAgainst, 3.5),
            label: `${stats.avgGoalsAgainst} buts encaissés / match`,
          },
          {
            subject: "Points / match domicile",
            value: normalize(stats.homeAvgPoints, 3),
            label: `${stats.homeAvgPoints} pts (max 3)`,
          },
        ]}
      />
      <StatList
        columns={[
          [
            { label: "Total matchs", value: stats.matches },
            { label: "Victoires", value: stats.wins },
            { label: "Défaites", value: stats.losses },
            { label: "Taux victoire", value: `${stats.winRate}%` },
            { label: "Points", value: stats.points },
            { label: "Buts marqués", value: stats.goalsFor },
            { label: "Différence buts", value: stats.goalDifference },
            { label: "Clean sheets", value: stats.cleanSheets },
            { label: "Taux clean sheet", value: `${stats.cleanSheetRate}%` },
          ],
          [
            { label: "Moy. buts marqués", value: stats.avgGoalsFor },
            { label: "Moy. buts encaissés", value: stats.avgGoalsAgainst },
            { label: "Victoires domicile", value: stats.homeWins },
            { label: "Défaites domicile", value: stats.homeLosses },
            { label: "Taux vict. domicile", value: `${stats.homeWinRate}%` },
            { label: "Diff. buts domicile", value: stats.homeGoalDifference },
            { label: "Moy. points domicile", value: stats.homeAvgPoints },
            { label: "Diff. buts extérieur", value: stats.awayGoalDifference },
            { label: "Moy. points extérieur", value: stats.awayAvgPoints },
          ],
        ]}
      />
      <TeamPlayingTime teamId={team.id} className="lg:col-span-3" />
    </div>
  );
}

function PlayerStatsView({ team }: { team: Team }) {
  const { data: stats, isLoading, error, refetch } = usePlayerStats();
  const { data: profile } = useProfile();

  if (isLoading) return <StatsSkeleton />;
  if (error || !stats) return <ErrorState error={error} onRetry={refetch} />;
  if (stats.matches === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Pas encore de statistiques"
        description="Elles apparaîtront après ton premier match, quand ton coach aura saisi les stats."
      />
    );
  }

  const name = profile?.name ?? "";

  return (
    <div className={layout}>
      <StatsHeader
        name={name}
        image={profile?.image}
        caption={{ name: team.name, image: team.logoUrl }}
        highlights={[
          { label: "Matchs", value: stats.matches },
          { label: "Buts", value: stats.goals },
          { label: "Passes D.", value: stats.assists },
        ]}
      />
      <StatsRadar
        title={name}
        data={[
          { subject: "Note moyenne", value: normalize(stats.avgRating, 10), label: `${stats.avgRating} / 10` },
          { subject: "Titularisation", value: normalize(stats.startRate, 100), label: `${stats.startRate}%` },
          { subject: "G+A / 90", value: normalize(stats.contributionsPer90, 2), label: `${stats.contributionsPer90}` },
          { subject: "Buts / 90", value: normalize(stats.goalsPer90, 1.5), label: `${stats.goalsPer90}` },
          { subject: "PD / 90", value: normalize(stats.assistsPer90, 1), label: `${stats.assistsPer90}` },
        ]}
      />
      <StatList
        columns={[
          [
            { label: "Total matchs", value: stats.matches },
            { label: "Total buts", value: stats.goals },
            { label: "Passes décisives", value: stats.assists },
            { label: "Buts + passes D.", value: stats.goalContributions },
            { label: "Note moyenne", value: stats.avgRating ? stats.avgRating.toFixed(1) : "—" },
            { label: "Matchs titulaire", value: stats.starts },
            { label: "Minutes jouées", value: stats.minutes },
            { label: "Minutes / match", value: stats.avgMinutes },
          ],
          [
            { label: "Titulaire", value: `${stats.startRate}%` },
            { label: "Buts / match", value: stats.goalsPerMatch },
            { label: "Passes D. / match", value: stats.assistsPerMatch },
            { label: "G+A / 90 min", value: stats.contributionsPer90 },
            { label: "Buts / 90 min", value: stats.goalsPer90 },
            { label: "Passes D. / 90 min", value: stats.assistsPer90 },
          ],
        ]}
      />
    </div>
  );
}
