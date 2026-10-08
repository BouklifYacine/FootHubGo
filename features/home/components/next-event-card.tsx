"use client";

import Link from "next/link";
import { CalendarPlus, ChevronRight, Clock, MapPin } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDayLabel, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AttendanceAnswer, CallUpAnswer } from "@/features/call-ups/components/call-up-answer";
import { EVENT_TYPES } from "@/features/events/event-types";
import { AttendanceSummary, CallUpSummary } from "@/features/events/components/participation-summary";
import type { HomeData } from "../types";

/**
 * "Prochain rendez-vous": the next match or training of the section, with the player's answer
 * buttons or the coach's call-up summary right on it (the most frequent actions of the app).
 */
export function NextEventCard({ event, canManage }: { event: HomeData["nextEvent"]; canManage: boolean }) {
  if (!event) {
    return (
      <div data-tour="home-next-event">
        <EmptyState
          icon={CalendarPlus}
          title="Aucun événement à venir"
          description={
            canManage
              ? "Programme ton prochain match ou entraînement : tes joueurs seront prévenus."
              : "Ton coach n'a encore rien programmé. Tu seras prévenu dès qu'il le fera."
          }
          action={canManage ? { label: "Nouvel événement", href: "/app/events?new=1", icon: CalendarPlus } : undefined}
        />
      </div>
    );
  }

  const type = EVENT_TYPES[event.type];
  const heading = event.type === "TRAINING" ? event.title : event.opponent ? `Contre ${event.opponent}` : event.title;

  return (
    <section
      data-tour="home-next-event"
      aria-labelledby="next-event-title"
      className="relative overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <div className={cn("absolute inset-y-0 left-0 w-1.5", type.accentClass)} aria-hidden />
      <Link
        href={`/app/events/${event.id}`}
        className="block space-y-2 p-4 pl-5 outline-none focus-visible:bg-accent/50 active:bg-accent/50"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Prochain rendez-vous</p>
          <div className="flex items-center gap-1.5">
            {event.isClubEvent && <Badge variant="outline">Tout le club</Badge>}
            <Badge className={type.badgeClass}>{type.label}</Badge>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2">
          <h2 id="next-event-title" className="text-xl font-semibold tracking-tight">
            {heading}
          </h2>
          <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="size-4 text-muted-foreground" aria-hidden />
            {formatDayLabel(event.startDate)} à {formatTime(event.startDate)}
          </span>
          {event.location && (
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{event.location}</span>
            </span>
          )}
        </div>
      </Link>

      {(event.myCallUp || event.myAttendance || event.callUps || event.attendance) && (
        <div className="space-y-3 border-t p-4 pl-5">
          {event.myCallUp && <CallUpAnswer callUp={event.myCallUp} />}
          {!event.myCallUp && event.myAttendance && (
            <AttendanceAnswer eventId={event.id} status={event.myAttendance.status} canAnswer={event.myAttendance.canAnswer} />
          )}
          {event.callUps && <CallUpSummary eventId={event.id} title={heading} counts={event.callUps} />}
          {event.attendance && <AttendanceSummary counts={event.attendance} />}
        </div>
      )}
    </section>
  );
}
