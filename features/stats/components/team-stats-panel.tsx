"use client";

import { Loader2 } from "lucide-react";
import type { MatchResult } from "@/generated/prisma/browser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { competitionLabels, matchResultLabels } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { deleteTeamStats } from "../actions";
import { statsInvalidation, useEventStats } from "../hooks/use-event-stats";
import type { EventTeamStat } from "../types";
import { ConfirmDeleteButton } from "./confirm-delete-button";
import { TeamStatsDialog } from "./team-stats-form";

const resultColors: Record<MatchResult, string> = {
  WIN: "bg-green-500",
  LOSS: "bg-red-500",
  DRAW: "bg-gray-500",
};

/** Score + team stats of a match, with the coach's add / edit / delete buttons. */
export function TeamStatsPanel({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useEventStats(eventId);
  const { data: myTeam } = useMyTeam();
  const remove = useActionMutation(deleteTeamStats, { invalidate: statsInvalidation });

  if (isLoading) return <Loader2 className="mx-auto size-6 animate-spin" />;
  if (error || !data) return <p className="text-center text-sm text-red-500">{error?.message}</p>;

  const { event, teamStat, window } = data;
  if (event.type === "TRAINING") return null;

  const isCoach = myTeam?.role === "COACH";
  const defaultCompetition = event.type === "CUP" ? "CUP" : "LEAGUE";

  return (
    <div className="space-y-2">
      {isCoach && (
        <div className="flex gap-2">
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
                Supprimer stats
              </ConfirmDeleteButton>
            </>
          ) : (
            window.isOpen && <TeamStatsDialog eventId={eventId} defaultCompetition={defaultCompetition} />
          )}
        </div>
      )}

      {teamStat ? (
        <Scoreboard
          teamStat={teamStat}
          teamName={event.team.name}
          teamLogoUrl={event.team.logoUrl}
          opponent={event.opponent ?? teamStat.opponent}
        />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          {window.isOpen
            ? "Aucune statistique d'équipe pour ce match."
            : "Les statistiques seront disponibles 3 heures après le début du match."}
        </p>
      )}
    </div>
  );
}

type ScoreboardProps = {
  teamStat: EventTeamStat;
  teamName: string;
  teamLogoUrl: string | null;
  opponent: string;
};

function Scoreboard({ teamStat, teamName, teamLogoUrl, opponent }: ScoreboardProps) {
  const details = [
    teamStat.isHome ? "Domicile" : "Extérieur",
    competitionLabels[teamStat.competition],
    teamStat.totalShots != null && `${teamStat.totalShots} tirs`,
    teamStat.shotsOnTarget != null && `${teamStat.shotsOnTarget} cadrés`,
    teamStat.cleanSheet && "Clean sheet",
  ].filter(Boolean);

  return (
    <div className="flex items-center justify-center">
      <div className="border border-blue-500 rounded-2xl p-6 md:p-10 w-full md:w-3/4 lg:w-2/3 max-w-3xl">
        <div className="flex justify-center">
          <Badge
            className={`text-xs md:text-xl font-bold tracking-tighter rounded-xl ${resultColors[teamStat.result]}`}
          >
            {matchResultLabels[teamStat.result]}
          </Badge>
        </div>

        <div className="flex items-center justify-between w-full mt-4 gap-2">
          <TeamSide name={teamName} logoUrl={teamLogoUrl} />
          <span className="text-base md:text-5xl font-bold text-center whitespace-nowrap">
            {teamStat.goalsFor} - {teamStat.goalsAgainst}
          </span>
          <TeamSide name={opponent} logoUrl={null} />
        </div>

        <p className="mt-4 text-center text-xs md:text-sm text-muted-foreground">{details.join(" · ")}</p>
      </div>
    </div>
  );
}

function TeamSide({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  return (
    <div className="flex flex-col items-center flex-1 min-w-0 gap-1 md:gap-2">
      <Avatar className="size-8 md:size-16">
        <AvatarImage src={logoUrl ?? undefined} alt={name} className="object-contain" />
        <AvatarFallback className="font-semibold">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="md:text-3xl font-bold text-center truncate max-w-full">{name}</span>
    </div>
  );
}
