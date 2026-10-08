"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingState } from "@/components/app/loading-state";
import { ErrorState } from "@/components/app/error-state";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/app/responsive-dialog";
import { callUpStatusLabels, playerPositionLabels } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { sendCallUps } from "../actions";
import { participationInvalidation } from "../invalidation";
import { CALL_UP_RULES } from "../server/rules";
import { useEventCallUps } from "../hooks/use-event-call-ups";

type Props = {
  eventId: string;
  /** "Retour" (calendar dialog) or "Annuler" (closes the dialog). */
  onBack: () => void;
  backLabel?: string;
  onSent?: () => void;
};

/** Coach: select several players of a match and call them up at once. */
export function CallUpPicker({ eventId, onBack, backLabel = "Retour", onSent }: Props) {
  const { data, isPending, error, refetch } = useEventCallUps(eventId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const send = useActionMutation(sendCallUps, {
    invalidate: [queryKeys.events.callUps(eventId), ...participationInvalidation],
    onSuccess: () => {
      setSelected(new Set());
      onSent?.();
    },
  });

  if (isPending) return <LoadingState rows={3} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const available = data.players.filter((player) => !player.callUp && !player.isInjured).map((p) => p.userId);
  const allSelected = available.length > 0 && available.every((id) => selected.has(id));
  const toggle = (userId: string, checked: boolean) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (checked) next.add(userId);
      else next.delete(userId);
      return next;
    });

  return (
    <>
      {!data.canSend && (
        <p className="rounded-md border p-3 text-sm text-muted-foreground">
          Les convocations s&apos;envoient au moins {CALL_UP_RULES.sendMinHours}h avant le match.
        </p>
      )}
      {data.canSend && available.length > 0 && (
        <label className="flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm font-medium">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => setSelected(checked === true ? new Set(available) : new Set())}
          />
          Tout sélectionner ({available.length} disponibles)
        </label>
      )}

      <ul className="max-h-[45dvh] divide-y overflow-y-auto rounded-md border md:max-h-80">
        {data.players.length === 0 && <li className="p-3 text-sm text-muted-foreground">Aucun joueur dans l&apos;équipe</li>}
        {data.players.map((player) => {
          const selectable = data.canSend && !player.callUp && !player.isInjured;
          return (
            <li key={player.userId}>
              <label className="flex min-h-12 items-center gap-3 px-3 py-2">
                <Checkbox
                  disabled={!selectable}
                  checked={selected.has(player.userId)}
                  onCheckedChange={(checked) => toggle(player.userId, checked === true)}
                />
                <Avatar className="size-8">
                  <AvatarImage src={player.image ?? undefined} alt={player.name} />
                  <AvatarFallback>{player.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {player.name}
                  {player.position && (
                    <span className="ml-2 text-xs text-muted-foreground">{playerPositionLabels[player.position]}</span>
                  )}
                </span>
                {player.callUp ? (
                  <Badge variant="outline">Convoqué · {callUpStatusLabels[player.callUp.status]}</Badge>
                ) : (
                  player.isInjured && <Badge variant="danger">Blessé</Badge>
                )}
              </label>
            </li>
          );
        })}
      </ul>

      <ResponsiveDialogFooter className="gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onBack}>
          {backLabel}
        </Button>
        <Button
          disabled={selected.size === 0 || send.isPending}
          onClick={() => send.mutate({ eventId, playerIds: [...selected] })}
        >
          <Send /> Convoquer{selected.size > 0 && ` (${selected.size})`}
        </Button>
      </ResponsiveDialogFooter>
    </>
  );
}

/** The picker in its own dialog / bottom sheet (home, agenda, event page). */
export function CallUpPickerDialog({
  eventId,
  title,
  open,
  onOpenChange,
}: {
  eventId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Convoquer pour {title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Les joueurs sont prévenus tout de suite et répondent depuis leur téléphone.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {open && (
          <CallUpPicker eventId={eventId} backLabel="Annuler" onBack={() => onOpenChange(false)} onSent={() => onOpenChange(false)} />
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
