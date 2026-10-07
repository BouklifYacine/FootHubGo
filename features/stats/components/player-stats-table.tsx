"use client";

import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { playerPositionLabels } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { deletePlayerStats } from "../actions";
import { statsInvalidation, useEventStats } from "../hooks/use-event-stats";
import { ConfirmDeleteButton } from "./confirm-delete-button";
import { PlayerStatsDialog } from "./player-stats-form";

const ratingColor = (rating: number) =>
  rating <= 5 ? "bg-red-600" : rating <= 6 ? "bg-orange-500" : rating <= 7 ? "bg-green-400" : "bg-green-500";

/** Per-player stats of a match, with the coach's add / edit / delete buttons. */
export function PlayerStatsTable({ eventId }: { eventId: string }) {
  const { data, isLoading, error } = useEventStats(eventId);
  const { data: myTeam } = useMyTeam();
  const remove = useActionMutation(deletePlayerStats, { invalidate: statsInvalidation });

  if (isLoading) return <Loader2 className="mx-auto size-6 animate-spin" />;
  if (error || !data) return <p className="text-center text-sm text-red-500">{error?.message}</p>;
  if (data.event.type === "TRAINING") return null;

  const { teamStat, playerStats, eligiblePlayers, window } = data;
  const isCoach = myTeam?.role === "COACH";
  const canAdd = isCoach && !!teamStat && eligiblePlayers.length > 0;

  return (
    <div className="space-y-2">
      {canAdd && (
        <div className="flex items-center justify-end gap-2 text-sm">
          Ajouter les stats d&apos;un joueur
          <PlayerStatsDialog eventId={eventId} players={eligiblePlayers} />
        </div>
      )}

      {playerStats.length === 0 ? (
        <p className="p-4 text-center">Aucune statistique joueur disponible.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Buts</TableHead>
                <TableHead>Passes décisives</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Titulaire</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Minutes jouées</TableHead>
                {isCoach && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {playerStats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell>
                    <Avatar className="size-9">
                      <AvatarImage src={stat.user.image ?? undefined} alt={stat.user.name} />
                      <AvatarFallback>{stat.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{stat.user.name}</TableCell>
                  <TableCell>{stat.goals}</TableCell>
                  <TableCell>{stat.assists}</TableCell>
                  <TableCell>{playerPositionLabels[stat.position]}</TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-md border text-md ${
                        stat.isStarter
                          ? "border-emerald-800 bg-emerald-100 text-emerald-800"
                          : "border-red-800 bg-red-200 text-red-800"
                      }`}
                    >
                      {stat.isStarter ? <CircleCheck size={16} /> : <CircleX size={16} />}
                      {stat.isStarter ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-md flex items-center justify-center w-10 text-white ${ratingColor(stat.rating)}`}
                    >
                      {stat.rating}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="bg-gray-700 dark:bg-black border rounded-md flex items-center justify-center w-10 text-white">
                      {stat.minutesPlayed}
                    </span>
                  </TableCell>
                  {isCoach && (
                    <TableCell>
                      <div className="flex gap-2">
                        {window.isEditable && <PlayerStatsDialog eventId={eventId} stat={stat} />}
                        <ConfirmDeleteButton
                          title={`Supprimer les stats de ${stat.user.name} ?`}
                          description="Les statistiques de ce joueur pour ce match seront supprimées."
                          onConfirm={() => remove.mutate(stat.id)}
                          disabled={remove.isPending}
                        />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
