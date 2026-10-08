"use client";

import { Timer } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { useEventStats } from "../hooks/use-event-stats";
import { STATS_OPEN_AFTER_HOURS } from "../compute";
import { PlayingTimeSheet } from "./playing-time-sheet";

/** "Temps de jeu" tab of a match: minutes of each player (most first) + the coach's sheet. */
export function PlayingTimeList({ eventId }: { eventId: string }) {
  const { data, isLoading, error, refetch } = useEventStats(eventId);
  const { data: myTeam } = useMyTeam();

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState error={error} onRetry={refetch} />;

  const isCoach = myTeam?.role === "COACH";
  const { teamStat, window, presentPlayers } = data;
  const played = data.playerStats.filter((stat) => stat.minutesPlayed > 0).sort((a, b) => b.minutesPlayed - a.minutesPlayed);
  const longest = Math.max(90, ...played.map((stat) => stat.minutesPlayed));
  const canEnter = isCoach && !!teamStat && window.isOpen && window.isEditable && presentPlayers.length > 0;

  const coachHint = !window.isOpen
    ? `Le temps de jeu se saisit à partir de ${STATS_OPEN_AFTER_HOURS}h après le coup d'envoi.`
    : !teamStat
      ? "Saisis d'abord le score du match."
      : presentPlayers.length === 0
        ? "Aucun joueur n'a confirmé sa convocation."
        : undefined;

  return (
    <div className="space-y-3">
      {canEnter && <PlayingTimeSheet eventId={eventId} players={presentPlayers} stats={data.playerStats} />}
      {played.length === 0 ? (
        <EmptyState
          icon={Timer}
          title="Pas encore de temps de jeu"
          description={isCoach ? coachHint ?? "Indique les minutes de chaque joueur présent." : "Le coach le saisit après le match."}
        />
      ) : (
        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
          {played.map((stat) => (
            <li key={stat.id} className="flex items-center gap-3 px-4 py-2.5">
              <InitialsAvatar name={stat.user.name} src={stat.user.image} className="size-9" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{stat.user.name}</span>
                  <Badge variant={stat.isStarter ? "info" : "muted"}>{stat.isStarter ? "Titulaire" : "Entré en jeu"}</Badge>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div className="h-full rounded-full bg-info" style={{ width: `${(stat.minutesPlayed / longest) * 100}%` }} />
                </div>
              </div>
              <span className="w-14 text-right text-sm font-semibold tabular-nums">{stat.minutesPlayed}&apos;</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
