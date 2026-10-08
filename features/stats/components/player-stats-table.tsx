"use client";

import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { playerPositionLabels } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { deletePlayerStats } from "../actions";
import { statsInvalidation, useEventStats } from "../hooks/use-event-stats";
import { ConfirmDeleteButton } from "./confirm-delete-button";
import { PlayerStatsDialog } from "./player-stats-form";

/** Per-player stats of a match, with the coach's add / edit / delete buttons. */
export function PlayerStatsTable({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useEventStats(eventId);
  const { data: myTeam } = useMyTeam();
  const remove = useActionMutation(deletePlayerStats, { invalidate: statsInvalidation });

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState error={error} />;
  if (data.event.type === "TRAINING") return null;

  const { teamStat, playerStats, eligiblePlayers, window } = data;
  const isCoach = myTeam?.role === "COACH";
  const canAdd = isCoach && !!teamStat && eligiblePlayers.length > 0;

  const actions = (stat: (typeof playerStats)[number]) =>
    isCoach && (
      <div className="flex gap-1">
        {window.isEditable && <PlayerStatsDialog eventId={eventId} stat={stat} />}
        <ConfirmDeleteButton
          title={`Supprimer les stats de ${stat.user.name} ?`}
          description="Les statistiques de ce joueur pour ce match seront supprimées."
          onConfirm={() => remove.mutate(stat.id)}
          disabled={remove.isPending}
        />
      </div>
    );

  return (
    <div className="space-y-3">
      {canAdd && (
        <div className="flex items-center justify-between gap-2 rounded-xl border bg-card px-4 py-2 text-sm">
          Ajouter les stats d&apos;un joueur
          <PlayerStatsDialog eventId={eventId} players={eligiblePlayers} />
        </div>
      )}

      {playerStats.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Pas encore de statistiques joueur"
          description={isCoach ? (teamStat ? "Ajoute les stats de tes joueurs." : "Saisis d'abord le score du match.") : undefined}
        />
      ) : (
        <>
          <ul className="divide-y overflow-hidden rounded-xl border bg-card md:hidden">
            {playerStats.map((stat) => (
              <li key={stat.id} className="flex items-center gap-3 px-4 py-2.5">
                <InitialsAvatar name={stat.user.name} src={stat.user.image} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{stat.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.goals} but{stat.goals > 1 ? "s" : ""} · {stat.assists} passe{stat.assists > 1 ? "s" : ""} · {stat.minutesPlayed} min
                    {stat.isStarter ? " · titulaire" : ""}
                  </p>
                </div>
                {stat.rating !== null && (
                  <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold tabular-nums" aria-label={`Note ${stat.rating}`}>
                    {stat.rating}
                  </span>
                )}
                {actions(stat)}
              </li>
            ))}
          </ul>
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Joueur</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead className="text-right">Buts</TableHead>
                  <TableHead className="text-right">Passes D.</TableHead>
                  <TableHead className="text-right">Minutes</TableHead>
                  <TableHead>Titulaire</TableHead>
                  <TableHead className="text-right">Note</TableHead>
                  {isCoach && (
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerStats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={stat.user.name} src={stat.user.image} className="size-9" />
                        <span className="font-medium">{stat.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{stat.position ? playerPositionLabels[stat.position] : "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{stat.goals}</TableCell>
                    <TableCell className="text-right tabular-nums">{stat.assists}</TableCell>
                    <TableCell className="text-right tabular-nums">{stat.minutesPlayed}</TableCell>
                    <TableCell>{stat.isStarter ? "Oui" : "Non"}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{stat.rating ?? "—"}</TableCell>
                    {isCoach && <TableCell>{actions(stat)}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
