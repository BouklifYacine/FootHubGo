"use client";

import { Timer, Trophy } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { useTeamPlayingTime } from "../hooks/use-team-playing-time";

/** Coach's stats page: who played the most this season (minutes, matches, average per match). */
export function TeamPlayingTime({ teamId, className }: { teamId: string; className?: string }) {
  const { data, isLoading, error, refetch } = useTeamPlayingTime(teamId);

  return (
    <section className={cn("rounded-2xl border bg-card p-4", className)} aria-labelledby="playing-time-title">
      <h2 id="playing-time-title" className="font-semibold">
        Temps de jeu
      </h2>
      <p className="mb-3 text-sm text-muted-foreground">Qui a le plus joué cette saison (et combien de fois homme du match).</p>
      {isLoading ? (
        <LoadingState rows={3} />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : data.every((player) => player.minutes === 0) ? (
        <EmptyState bare icon={Timer} title="Pas encore de minutes" description="Saisis le temps de jeu depuis la page d'un match." />
      ) : (
        <ol className="divide-y">
          {data.map((player, index) => {
            const longest = Math.max(1, data[0].minutes);
            return (
              <li key={player.userId} className="flex items-center gap-3 py-2.5">
                <span className="w-5 text-right text-sm text-muted-foreground tabular-nums">{index + 1}</span>
                <InitialsAvatar name={player.name} src={player.image} className="size-9" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{player.name}</span>
                    {player.motmAwards > 0 && (
                      <span
                        className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-warning"
                        aria-label={`${player.motmAwards} fois homme du match`}
                        title="Homme du match"
                      >
                        <Trophy className="size-3.5" aria-hidden /> {player.motmAwards}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {player.matches} match{player.matches > 1 ? "s" : ""} · {player.starts} titulaire{player.starts > 1 ? "s" : ""} · {player.avgMinutes}&apos; / match
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div className="h-full rounded-full bg-info" style={{ width: `${(player.minutes / longest) * 100}%` }} />
                  </div>
                </div>
                <span className="text-right text-sm font-semibold tabular-nums">{player.minutes}&apos;</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
