"use client";

import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { competitionLabels } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { deleteTeamStats } from "../actions";
import { statsInvalidation, useEventStats } from "../hooks/use-event-stats";
import type { EventTeamStat } from "../types";
import { ConfirmDeleteButton } from "./confirm-delete-button";
import { TeamStatsDialog } from "./team-stats-form";


/** Score + team stats of a match, with the coach's add / edit / delete buttons. */
export function TeamStatsPanel({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useEventStats(eventId);
  const { data: myTeam } = useMyTeam();
  const remove = useActionMutation(deleteTeamStats, { invalidate: statsInvalidation });

  if (isLoading) return <LoadingState rows={1} />;
  if (error || !data) return <ErrorState error={error} />;

  const { event, teamStat, window } = data;
  if (event.type === "TRAINING") return null;

  const isCoach = myTeam?.role === "COACH";
  const defaultCompetition = event.type === "CUP" ? "CUP" : "LEAGUE";

  return (
    <div className="space-y-2">
      {isCoach && (
        <div className="flex flex-wrap gap-2">
          {teamStat ? (
            <>
              {window.isEditable && (
                <TeamStatsDialog
                  eventId={eventId}
                  teamStat={teamStat}
                  defaultCompetition={defaultCompetition}
                />
              )}
              <ConfirmDeleteButton
                title="Supprimer les statistiques ?"
                description="Les statistiques de l'équipe et de tous les joueurs pour ce match seront supprimées."
                onConfirm={() => remove.mutate(eventId)}
                disabled={remove.isPending}
              >
                Supprimer le score
              </ConfirmDeleteButton>
            </>
          ) : (
            window.isOpen && <TeamStatsDialog eventId={eventId} defaultCompetition={defaultCompetition} />
          )}
        </div>
      )}

      {teamStat ? (
        <MatchDetails teamStat={teamStat} />
      ) : (
        <p className="text-sm text-muted-foreground">
          {window.isOpen
            ? "Aucune statistique d'équipe pour ce match."
            : "Le score et les statistiques se saisissent à partir de 3h après le coup d'envoi."}
        </p>
      )}
    </div>
  );
}

/** What the score doesn't say (the score itself is in the event header, shown once). */
function MatchDetails({ teamStat }: { teamStat: EventTeamStat }) {
  const details = [
    teamStat.isHome ? "Domicile" : "Extérieur",
    competitionLabels[teamStat.competition],
    teamStat.totalShots != null && `${teamStat.totalShots} tirs`,
    teamStat.shotsOnTarget != null && `${teamStat.shotsOnTarget} cadrés`,
    teamStat.cleanSheet && "Clean sheet",
  ].filter(Boolean);
  return <p className="text-sm text-muted-foreground">{details.join(" · ")}</p>;
}
