"use client";

import type { QueryKey } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Ellipsis, House, Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EVENT_TYPES } from "../event-types";
import { useDeleteEvent } from "../hooks/use-event-actions";
import type { EventListItem } from "../types";
import { AttendanceSelect } from "./attendance-select";

type Props = { event: EventListItem; isCoach: boolean; listKey: QueryKey };

export function EventCard({ event, isCoach, listKey }: Props) {
  const deleteEvent = useDeleteEvent();
  const isPast = new Date(event.startDate) < new Date();

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-bold tracking-tighter md:text-3xl">{event.opponent || event.title}</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" aria-label="Actions">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/app/events/${event.id}`}>Voir le détail</Link>
            </DropdownMenuItem>
            {isCoach && !event.hasStats && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/app/calendar">Modifier dans le calendrier</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={deleteEvent.isPending}
                  onClick={() => deleteEvent.mutate(event.id)}
                >
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2">
          <Calendar className="size-5" /> {format(event.startDate, "dd/MM/yyyy HH'h'mm")}
        </p>
        <p className="flex items-center gap-2">
          <House className="size-5" /> {event.location || "Lieu non indiqué"}
        </p>
      </div>

      <div className="flex min-h-9 items-center justify-between">
        {!isCoach && event.type === "TRAINING" ? (
          <AttendanceSelect eventId={event.id} value={event.myAttendance} disabled={isPast} listKey={listKey} />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {event.hasStats && <Lock className="size-4 text-muted-foreground" aria-label="Statistiques saisies" />}
          <Badge className={EVENT_TYPES[event.type].badgeClass}>{EVENT_TYPES[event.type].label}</Badge>
        </div>
      </div>
    </div>
  );
}
