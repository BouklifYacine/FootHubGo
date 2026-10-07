"use client";

import { format } from "date-fns";
import { Send, X } from "lucide-react";
import type { CallUpStatus } from "@/generated/prisma/browser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { callUpStatusLabels, playerPositionLabels } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import { cancelCallUp, sendCallUps } from "../actions";
import { useEventCallUps } from "../hooks/use-event-call-ups";
import type { EventCallUpPlayer } from "../types";

const statusClass: Record<CallUpStatus, string> = {
  PENDING: "border-orange-500 bg-orange-100 text-orange-700",
  CONFIRMED: "border-green-500 bg-green-100 text-green-700",
  DECLINED: "border-red-500 bg-red-100 text-red-700",
  EXPIRED: "border-gray-400 bg-gray-100 text-gray-600",
};

const formatDate = (date: string | null) => (date ? format(date, "dd/MM/yyyy 'à' HH:mm") : "-");

function YesNo({ value, good = true }: { value: boolean; good?: boolean }) {
  const positive = value === good;
  return (
    <Badge
      variant="outline"
      className={positive ? "border-emerald-700 bg-emerald-100 text-emerald-800" : "border-red-700 bg-red-100 text-red-800"}
    >
      {value ? "Oui" : "Non"}
    </Badge>
  );
}

/** Players of the team for a match. The coach also sees and manages the call-ups. */
export function CallUpTable({ eventId, isCoach }: { eventId: string; isCoach: boolean }) {
  const { data, isPending, error } = useEventCallUps(eventId);
  const invalidate = [queryKeys.events.callUps(eventId), queryKeys.me.callUps];
  const send = useActionMutation(sendCallUps, { invalidate });
  const cancel = useActionMutation(cancelCallUp, { invalidate });

  if (isPending) return <p className="p-4 text-muted-foreground">Chargement des joueurs...</p>;
  if (error) return <p className="p-4 text-destructive">{error.message}</p>;
  if (data.players.length === 0) return <p className="p-4 text-center">Aucun joueur dans l&apos;équipe</p>;

  const renderAction = (player: EventCallUpPlayer) => {
    if (player.callUp) {
      return (
        data.canCancel && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                aria-label="Annuler la convocation"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate(player.callUp!.id)}
              >
                <X className="text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Annuler la convocation</TooltipContent>
          </Tooltip>
        )
      );
    }
    return (
      data.canSend && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              aria-label="Convoquer le joueur"
              disabled={player.isInjured || send.isPending}
              onClick={() => send.mutate({ eventId, playerIds: [player.userId] })}
            >
              <Send />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{player.isInjured ? "Joueur blessé" : "Envoyer une convocation"}</TooltipContent>
        </Tooltip>
      )
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Joueur</TableHead>
          <TableHead>Poste</TableHead>
          <TableHead>Licencié</TableHead>
          <TableHead>Blessé</TableHead>
          {isCoach && (
            <>
              <TableHead>Convocation</TableHead>
              <TableHead>Envoyée le</TableHead>
              <TableHead>Réponse le</TableHead>
              <TableHead>Action</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.players.map((player) => (
          <TableRow key={player.userId}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={player.image ?? undefined} alt={player.name} />
                  <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{player.name}</span>
              </div>
            </TableCell>
            <TableCell>{player.position ? playerPositionLabels[player.position] : "-"}</TableCell>
            <TableCell>
              <YesNo value={player.isLicensed} />
            </TableCell>
            <TableCell>
              <YesNo value={player.isInjured} good={false} />
            </TableCell>
            {isCoach && (
              <>
                <TableCell>
                  {player.callUp ? (
                    <Badge variant="outline" className={cn(statusClass[player.callUp.status])}>
                      {callUpStatusLabels[player.callUp.status]}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Non convoqué</span>
                  )}
                </TableCell>
                <TableCell>{formatDate(player.callUp?.sentAt ?? null)}</TableCell>
                <TableCell>{formatDate(player.callUp?.respondedAt ?? null)}</TableCell>
                <TableCell>{renderAction(player)}</TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
