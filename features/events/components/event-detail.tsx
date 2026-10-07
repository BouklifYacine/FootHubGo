"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CallUpTable } from "@/features/call-ups/components/call-up-table";
import { PlayerStatsTable } from "@/features/stats/components/player-stats-table";
import { TeamStatsPanel } from "@/features/stats/components/team-stats-panel";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { useEvent } from "../hooks/use-event";
import { AttendanceTable } from "./attendance-table";
import { EventHeader } from "./event-header";

/** Event page: summary, then attendances (training) or call-ups + stats (match). */
export function EventDetail({ eventId }: { eventId: string }) {
  const { data: event, isPending, error } = useEvent(eventId);
  const { data: myTeam } = useMyTeam();
  const [tab, setTab] = useState<"players" | "stats">("players");

  if (isPending) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Erreur</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  if (event.isClubEvent) {
    return (
      <>
        <EventHeader event={event} />
        <p className="mx-auto max-w-xl text-center text-sm text-muted-foreground">
          Événement du club : visible par toutes les sections, sans convocation ni présence à indiquer.
        </p>
        {event.description && <p className="mx-auto max-w-xl whitespace-pre-line text-center">{event.description}</p>}
      </>
    );
  }

  if (event.type === "TRAINING") {
    return (
      <>
        <EventHeader event={event} />
        <AttendanceTable attendances={event.attendances} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <TeamStatsPanel eventId={eventId} />
      <div className="inline-flex rounded-lg border p-1">
        <Button size="sm" variant={tab === "players" ? "default" : "ghost"} onClick={() => setTab("players")}>
          Joueurs
        </Button>
        <Button size="sm" variant={tab === "stats" ? "default" : "ghost"} onClick={() => setTab("stats")}>
          Statistiques
        </Button>
      </div>
      <div className="overflow-x-auto">
        {tab === "players" ? (
          <CallUpTable eventId={eventId} isCoach={myTeam?.role === "COACH"} />
        ) : (
          <PlayerStatsTable eventId={eventId} />
        )}
      </div>
    </div>
  );
}
