"use client";

import { CircleAlert, Send, UsersRound, X } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { playerPositionLabels } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { cancelCallUp, sendCallUps } from "../actions";
import { useEventCallUps } from "../hooks/use-event-call-ups";
import { participationInvalidation } from "../invalidation";
import { CALL_UP_RULES } from "../server/rules";
import type { EventCallUpPlayer } from "../types";
import { CallUpStatusBadge } from "./call-up-answer";

type Group = { key: string; title: string; players: EventCallUpPlayer[] };

/** Coach: players grouped by answer. Players: the squad of the match. */
function groupPlayers(players: EventCallUpPlayer[], isCoach: boolean): Group[] {
  if (!isCoach) return [{ key: "all", title: `Effectif (${players.length})`, players }];
  const by = (test: (player: EventCallUpPlayer) => boolean) => players.filter(test);
  return [
    { key: "confirmed", title: "Présents", players: by((p) => p.callUp?.status === "CONFIRMED") },
    { key: "pending", title: "En attente", players: by((p) => p.callUp?.status === "PENDING") },
    { key: "declined", title: "Absents", players: by((p) => p.callUp?.status === "DECLINED" || p.callUp?.status === "EXPIRED") },
    { key: "none", title: "Non convoqués", players: by((p) => !p.callUp) },
  ].filter((group) => group.players.length > 0);
}

/** Players of the section for a match; the coach also sees and manages the call-ups. */
export function CallUpTable({ eventId, isCoach }: { eventId: string; isCoach: boolean }) {
  const { data, isPending, error, refetch } = useEventCallUps(eventId);
  const confirm = useConfirm();
  const invalidate = [queryKeys.events.callUps(eventId), ...participationInvalidation];
  const send = useActionMutation(sendCallUps, { invalidate });
  const cancel = useActionMutation(cancelCallUp, { invalidate });

  if (isPending) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (data.players.length === 0) {
    return <EmptyState icon={UsersRound} title="Aucun joueur dans la section" description="Invite tes joueurs depuis l'onglet Équipe." />;
  }

  const action = (player: EventCallUpPlayer) => {
    if (!isCoach) return null;
    if (player.callUp) {
      return data.canCancel ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          disabled={cancel.isPending}
          onClick={async () => {
            const ok = await confirm({
              title: `Annuler la convocation de ${player.name} ?`,
              description: `Il sera retiré de la liste. Possible jusqu'à ${CALL_UP_RULES.cancelMinHours}h avant le match.`,
              confirmLabel: "Annuler la convocation",
              cancelLabel: "Garder",
            });
            if (ok) cancel.mutate(player.callUp!.id);
          }}
        >
          <X /> Retirer
        </Button>
      ) : null;
    }
    if (player.isInjured) return <span className="text-xs text-muted-foreground">Blessé ce jour-là</span>;
    return data.canSend ? (
      <Button variant="outline" size="sm" disabled={send.isPending} onClick={() => send.mutate({ eventId, playerIds: [player.userId] })}>
        <Send /> Convoquer
      </Button>
    ) : null;
  };

  const chips = (player: EventCallUpPlayer) => (
    <>
      {isCoach && player.callUp && <CallUpStatusBadge status={player.callUp.status} playerView={false} />}
      {player.isInjured && (
        <Badge variant="danger">
          <CircleAlert aria-hidden /> Blessé
        </Badge>
      )}
      {!player.isLicensed && <Badge variant="muted">Non licencié</Badge>}
    </>
  );

  const groups = groupPlayers(data.players, isCoach);
  return (
    <>
      {isCoach && !data.canSend && (
        <p className="text-xs text-muted-foreground">
          Les convocations s&apos;envoient jusqu&apos;à {CALL_UP_RULES.sendMinHours}h avant le match.
        </p>
      )}
      <div className="space-y-4 md:hidden">
        {groups.map((group) => (
          <section key={group.key} className="space-y-2">
            <h3 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.title} {isCoach && `(${group.players.length})`}
            </h3>
            <ul className="divide-y overflow-hidden rounded-xl border bg-card">
              {group.players.map((player) => (
                <li key={player.userId} className="flex items-center gap-3 px-4 py-2.5">
                  <InitialsAvatar name={player.name} src={player.image} className="size-10" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium">{player.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {player.position ? playerPositionLabels[player.position] : "Poste non renseigné"}
                    </p>
                    <div className="flex flex-wrap gap-1 empty:hidden">{chips(player)}</div>
                  </div>
                  {action(player)}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Joueur</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Statut</TableHead>
              {isCoach && <TableHead>Réponse</TableHead>}
              {isCoach && (
                <TableHead>
                  <span className="sr-only">Action</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.flatMap((group) => group.players).map((player) => (
              <TableRow key={player.userId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={player.name} src={player.image} className="size-9" />
                    <span className="font-medium">{player.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {player.position ? playerPositionLabels[player.position] : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {chips(player)}
                    {isCoach && !player.callUp && <span className="text-sm text-muted-foreground">Non convoqué</span>}
                  </div>
                </TableCell>
                {isCoach && (
                  <TableCell className="text-sm text-muted-foreground">
                    {player.callUp?.respondedAt ? formatDateTime(player.callUp.respondedAt) : "-"}
                  </TableCell>
                )}
                {isCoach && <TableCell className="text-right">{action(player)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
