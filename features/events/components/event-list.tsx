"use client";

import { startOfToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { EventType } from "@/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { queryKeys } from "@/lib/query/keys";
import { EVENT_TYPE_KEYS, EVENT_TYPES } from "../event-types";
import { type EventListFilters, useEvents } from "../hooks/use-events";
import { EventCard } from "./event-card";

type When = "all" | "past" | "upcoming";

function toFilters(when: When, type: EventType | "all"): EventListFilters {
  const today = startOfToday().toISOString();
  return {
    from: when === "upcoming" ? today : undefined,
    to: when === "past" ? today : undefined,
    type: type === "all" ? undefined : type,
  };
}

export function EventList() {
  const [when, setWhen] = useState<When>("all");
  const [type, setType] = useState<EventType | "all">("all");
  const filters = toFilters(when, type);
  const { data: events, isPending, error } = useEvents(filters);
  const { data: myTeam } = useMyTeam();
  const isCoach = myTeam?.role === "COACH";
  const canManage = myTeam?.canManage ?? false;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
        {canManage && (
          <Button asChild>
            <Link href="/app/calendar">
              <CalendarDays /> Planning
            </Link>
          </Button>
        )}
        <Select value={when} onValueChange={(value) => setWhen(value as When)}>
          <SelectTrigger className="w-full md:w-[180px]" aria-label="Date">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les dates</SelectItem>
            <SelectItem value="upcoming">À venir</SelectItem>
            <SelectItem value="past">Passés</SelectItem>
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(value) => setType(value as EventType | "all")}>
          <SelectTrigger className="w-full md:w-[180px]" aria-label="Type d'événement">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {EVENT_TYPE_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {EVENT_TYPES[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending ? (
        <p className="text-muted-foreground">Chargement des événements...</p>
      ) : error ? (
        <p className="text-destructive">{error.message}</p>
      ) : events.length === 0 ? (
        <p>Aucun événement correspondant</p>
      ) : (
        <div className="flex flex-wrap items-start gap-7">
          {events.map((event) => (
            <EventCard key={event.id} event={event} isCoach={isCoach} listKey={queryKeys.events.list(filters)} />
          ))}
        </div>
      )}
    </div>
  );
}
