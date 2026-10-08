"use client";

import { Activity, CircleAlert, CircleCheck } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { useTeamInjuries } from "../hooks/use-injuries";

type Player = NonNullable<ReturnType<typeof useTeamInjuries>["data"]>[number];

function Status({ player }: { player: Player }) {
  return player.activeInjury ? (
    <Badge variant="danger">
      <CircleAlert aria-hidden /> Blessé jusqu&apos;au {formatDate(player.activeInjury.endDate)}
    </Badge>
  ) : (
    <Badge variant="success">
      <CircleCheck aria-hidden /> Apte
    </Badge>
  );
}

/** Coach view: injury status of every player (cards on phones, a table on md+), injured first. */
export function TeamInjuriesTable({ teamId }: { teamId: string }) {
  const { data, isLoading, error, refetch } = useTeamInjuries(teamId);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data?.length) {
    return <EmptyState icon={Activity} title="Aucun joueur" description="Invite tes joueurs depuis l'onglet Équipe." />;
  }
  const players = data.toSorted((a, b) => Number(!!b.activeInjury) - Number(!!a.activeInjury));

  return (
    <>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card md:hidden">
        {players.map((player) => (
          <li key={player.id} className="flex items-start gap-3 px-4 py-3">
            <InitialsAvatar name={player.name} src={player.image} className="size-10" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-medium">{player.name}</p>
              <Status player={player} />
              {player.activeInjury && <p className="text-xs text-muted-foreground">{player.activeInjury.type}</p>}
            </div>
            <span className="text-xs text-muted-foreground">
              {player.totalInjuries} blessure{player.totalInjuries > 1 ? "s" : ""}
            </span>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Joueur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Blessure</TableHead>
              <TableHead className="text-right">Blessures (total)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={player.name} src={player.image} className="size-9" />
                    <span className="font-medium">{player.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Status player={player} />
                </TableCell>
                <TableCell className="text-muted-foreground">{player.activeInjury?.type ?? "-"}</TableCell>
                <TableCell className="text-right tabular-nums">{player.totalInjuries}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
