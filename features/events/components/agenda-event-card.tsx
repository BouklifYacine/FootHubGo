"use client";

import Link from "next/link";
import { ChevronRight, MapPin, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AttendanceAnswer, CallUpAnswer } from "@/features/call-ups/components/call-up-answer";
import { EVENT_TYPES } from "../event-types";
import type { EventListItem } from "../types";
import { AttendanceSummary, CallUpSummary } from "./participation-summary";

const RESULT_LETTER = { WIN: "V", DRAW: "N", LOSS: "D" } as const;

/** One event of the agenda: the whole top is a link to the event page, the answer sits right under it. */
export function AgendaEventCard({ event, isPast }: { event: EventListItem; isPast: boolean }) {
  const type = EVENT_TYPES[event.type];
  const date = new Date(event.startDate);
  const heading = event.type === "TRAINING" ? event.title : event.opponent ? `Contre ${event.opponent}` : event.title;
  const showParticipation = !isPast && (event.myCallUp || event.myAttendance || event.callUps || event.attendance);

  return (
    <li className="relative overflow-hidden rounded-xl border bg-card">
      <div className={cn("absolute inset-y-0 left-0 w-1", type.accentClass)} aria-hidden />
      <Link
        href={`/app/events/${event.id}`}
        className="flex items-center gap-3 p-3 pl-4 outline-none hover:bg-accent/40 focus-visible:bg-accent active:bg-accent/60"
      >
        <div className="flex w-11 shrink-0 flex-col items-center rounded-lg bg-muted py-1 leading-tight" aria-hidden>
          <span className="text-[11px] font-medium text-muted-foreground uppercase">
            {date.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "")}
          </span>
          <span className="text-lg font-semibold tabular-nums">{date.getDate()}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate font-semibold">{heading}</p>
          <p className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
            <span className="shrink-0">{formatTime(event.startDate)}</span>
            {event.location && (
              <>
                <span aria-hidden>·</span>
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{event.location}</span>
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <Badge className={type.badgeClass}>{type.label}</Badge>
            {event.isClubEvent && <Badge variant="outline">Tout le club</Badge>}
            {event.seriesId && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Repeat className="size-3" aria-hidden /> Chaque semaine
              </span>
            )}
          </div>
        </div>
        {event.score ? (
          <span className="text-right">
            <span className="block text-base font-semibold tabular-nums">
              {event.score.goalsFor} - {event.score.goalsAgainst}
            </span>
            <span className="text-xs text-muted-foreground">{RESULT_LETTER[event.score.result]}</span>
          </span>
        ) : null}
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
      {showParticipation && (
        <div className="space-y-2 border-t p-3 pl-4">
          {event.myCallUp && <CallUpAnswer callUp={event.myCallUp} compact />}
          {!event.myCallUp && event.myAttendance && (
            <AttendanceAnswer eventId={event.id} status={event.myAttendance.status} canAnswer={event.myAttendance.canAnswer} />
          )}
          {event.callUps && <CallUpSummary eventId={event.id} title={heading} counts={event.callUps} compact />}
          {event.attendance && <AttendanceSummary counts={event.attendance} />}
        </div>
      )}
    </li>
  );
}
