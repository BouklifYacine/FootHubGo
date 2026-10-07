"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Lock, MapPin, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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

type Props = { event: EventListItem; canEdit: boolean; onEdit: () => void; onDeleted: () => void };

/** Read-only view of an event, with the coach's actions. */
export function EventDetails({ event, canEdit, onEdit, onDeleted }: Props) {
  const deleteEvent = useDeleteEvent(onDeleted);
  const locked = event.hasStats;

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Detail label="Titre">{event.title}</Detail>
        <Detail label="Date">{format(event.startDate, "d MMMM yyyy 'à' HH:mm", { locale: fr })}</Detail>
        <Detail label="Type">
          <Badge className={EVENT_TYPES[event.type].badgeClass}>{EVENT_TYPES[event.type].label}</Badge>
        </Detail>
        {isMatch(event.type) && <Detail label="Adversaire">{event.opponent || "-"}</Detail>}
        <Detail label="Lieu" wide>
          <span className="flex items-center gap-1">
            <MapPin className="size-4 text-muted-foreground" /> {event.location || "Non spécifié"}
          </span>
        </Detail>
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
            <Users /> {isMatch(event.type) ? "Voir les convocations" : "Voir les présences"}
          </Link>
        </Button>
        {canEdit && !locked && (
          <>
            <Button variant="outline" onClick={onEdit}>
              <Pencil /> Modifier
            </Button>
            <Button variant="destructive" disabled={deleteEvent.isPending} onClick={() => deleteEvent.mutate(event.id)}>
              <Trash2 /> Supprimer
            </Button>
          </>
        )}
      </DialogFooter>
    </>
  );
}
