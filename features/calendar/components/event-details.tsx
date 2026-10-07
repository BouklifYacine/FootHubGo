"use client";

import { formatDateTime } from "@/lib/format";
import { Lock, MapPin, Pencil, Repeat, Send, Trash2, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EVENT_TYPES, isMatch } from "@/features/events/event-types";
import { useDeleteEvent } from "@/features/events/hooks/use-event-actions";
import type { EventListItem } from "@/features/events/types";

function Detail({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="font-medium">{children}</div>
    </div>
  );
}

type Props = {
  event: EventListItem;
  onEdit: () => void;
  onCallUps: () => void;
  onDeleted: () => void;
};

/** Read-only view of an event, with the coach's actions. */
export function EventDetails({ event, onEdit, onCallUps, onDeleted }: Props) {
  const canEdit = event.canEdit;
  const deleteEvent = useDeleteEvent(onDeleted);
  const locked = event.hasStats;
  const remove = (withFollowing: boolean) => deleteEvent.mutate({ eventId: event.id, withFollowing });

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Detail label="Titre">{event.title}</Detail>
        {event.isClubEvent && <Detail label="Pour">Tout le club</Detail>}
        <Detail label="Date">{formatDateTime(event.startDate)}</Detail>
        <Detail label="Type">
          <span className="flex items-center gap-2">
            <Badge className={EVENT_TYPES[event.type].badgeClass}>{EVENT_TYPES[event.type].label}</Badge>
            {event.seriesId && <Repeat aria-label="Répété chaque semaine" className="size-4 text-muted-foreground" />}
          </span>
        </Detail>
        {isMatch(event.type) && <Detail label="Adversaire">{event.opponent || "-"}</Detail>}
        <Detail label="Lieu" wide>
          <span className="flex items-center gap-1">
            <MapPin className="size-4 text-muted-foreground" /> {event.location || "Non spécifié"}
          </span>
        </Detail>
        {event.description && (
          <Detail label="Description" wide>
            <p className="whitespace-pre-line font-normal">{event.description}</p>
          </Detail>
        )}
      </div>

      {canEdit && locked && (
        <p className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Lock className="size-4 shrink-0" />
          Cet événement a des statistiques enregistrées et ne peut plus être modifié ni supprimé.
        </p>
      )}

      <DialogFooter className="gap-2">
        <Button variant="outline" asChild>
          <Link href={`/app/events/${event.id}`}>
            <Users /> {event.isClubEvent ? "Voir le détail" : isMatch(event.type) ? "Voir les convocations" : "Voir les présences"}
          </Link>
        </Button>
        {canEdit && isMatch(event.type) && !event.isClubEvent && (
          <Button variant="outline" onClick={onCallUps}>
            <Send /> Convoquer
          </Button>
        )}
        {canEdit && !locked && (
          <>
            <Button variant="outline" onClick={onEdit}>
              <Pencil /> Modifier
            </Button>
            {event.seriesId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="destructive" disabled={deleteEvent.isPending}>
                    <Trash2 /> Supprimer
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => remove(false)}>Cet entraînement</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => remove(true)}>Celui-ci et les suivants</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="destructive" disabled={deleteEvent.isPending} onClick={() => remove(false)}>
                <Trash2 /> Supprimer
              </Button>
            )}
          </>
        )}
      </DialogFooter>
    </>
  );
}
