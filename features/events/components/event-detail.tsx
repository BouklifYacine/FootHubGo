"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/app/confirm-dialog";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { SectionTitle } from "@/components/app/page-header";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { AttendanceAnswer, CallUpAnswer } from "@/features/call-ups/components/call-up-answer";
import { CallUpTable } from "@/features/call-ups/components/call-up-table";
import { CarpoolCard } from "@/features/carpool/components/carpool-card";
import { MotmCard } from "@/features/motm/components/motm-card";
import { PlayerStatsTable } from "@/features/stats/components/player-stats-table";
import { PlayingTimeList } from "@/features/stats/components/playing-time-list";
import { TeamStatsPanel } from "@/features/stats/components/team-stats-panel";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { useDeleteEvent } from "../hooks/use-event-actions";
import { useEvent } from "../hooks/use-event";
import type { EventDetail as EventDetailData } from "../types";
import { AttendanceTable } from "./attendance-table";
import { EventFormDialog } from "./event-form-dialog";
import { EventHeader } from "./event-header";
import { AttendanceSummary, CallUpSummary } from "./participation-summary";

/**
 * The event page, hub of an event: header (score once), the player's answer or the coach's summary
 * + "Convoquer", the coach's edit / delete, then the squad and the stats of a match.
 */
export function EventDetail({ eventId }: { eventId: string }) {
  const { data: event, isPending, error, refetch } = useEvent(eventId);
  const { data: myTeam } = useMyTeam();
  const [tab, setTab] = useState<"players" | "stats" | "minutes">("players");

  if (isPending) return <LoadingState variant="detail" className="mx-auto max-w-3xl" />;
  if (error) return <ErrorState error={error} onRetry={refetch} title="Événement introuvable" className="mx-auto max-w-3xl" />;

  const heading = event.type === "TRAINING" ? event.title : event.opponent ? `Contre ${event.opponent}` : event.title;
  const isMatch = event.type !== "TRAINING";
  const isCoach = myTeam?.role === "COACH";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <EventHeader event={event} />

      {(event.myCallUp || event.myAttendance) && (
        <section className="rounded-2xl border bg-card p-4" aria-labelledby="my-answer-title">
          <h2 id="my-answer-title" className="mb-3 font-semibold">
            {event.myCallUp ? "Ma convocation" : "Ma présence"}
          </h2>
          {event.myCallUp ? (
            <CallUpAnswer callUp={event.myCallUp} />
          ) : (
            event.myAttendance && (
              <AttendanceAnswer eventId={event.id} status={event.myAttendance.status} canAnswer={event.myAttendance.canAnswer} />
            )
          )}
        </section>
      )}

      {(event.callUps || event.attendance) && (
        <section className="rounded-2xl border bg-card p-4" aria-labelledby="answers-title">
          <h2 id="answers-title" className="mb-3 font-semibold">
            {event.callUps ? "Convocations" : "Présences annoncées"}
          </h2>
          {event.callUps && <CallUpSummary eventId={event.id} title={heading} counts={event.callUps} />}
          {event.attendance && <AttendanceSummary counts={event.attendance} />}
        </section>
      )}

      {event.canEdit && <ManageEvent event={event} />}

      {isMatch && !event.isClubEvent && !event.isHome && <CarpoolCard eventId={eventId} />}

      {event.isClubEvent ? (
        <p className="text-sm text-muted-foreground">
          Événement du club : visible par toutes les sections, sans convocation ni présence à indiquer.
        </p>
      ) : !isMatch ? (
        <section className="space-y-2">
          <SectionTitle>Qui vient ?</SectionTitle>
          <AttendanceTable attendances={event.attendances} />
        </section>
      ) : (
        <section className="space-y-3">
          <TeamStatsPanel eventId={eventId} />
          <MotmCard eventId={eventId} />
          <SegmentedControl
            label="Afficher"
            value={tab}
            onChange={setTab}
            className="w-full md:w-auto"
            options={[
              { value: "players", label: "Effectif" },
              { value: "stats", label: "Statistiques" },
              { value: "minutes", label: "Temps de jeu" },
            ]}
          />
          {tab === "players" ? (
            <CallUpTable eventId={eventId} isCoach={isCoach} />
          ) : tab === "stats" ? (
            <PlayerStatsTable eventId={eventId} />
          ) : (
            <PlayingTimeList eventId={eventId} />
          )}
        </section>
      )}
    </div>
  );
}

/** Edit / delete (and the series option) for the people who manage the event. */
function ManageEvent({ event }: { event: EventDetailData }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [editing, setEditing] = useState(false);
  const deleteEvent = useDeleteEvent(() => router.push("/app/events"));
  if (event.hasStats) return null;

  const remove = async () => {
    const ok = await confirm({
      title: "Supprimer cet événement ?",
      description: event.seriesId
        ? "Il fait partie d'entraînements répétés : tu peux supprimer aussi les suivants."
        : "Les convocations et les présences liées seront supprimées.",
      confirmLabel: "Supprimer",
    });
    if (!ok) return;
    const withFollowing =
      !!event.seriesId &&
      (await confirm({
        title: "Supprimer aussi les entraînements suivants ?",
        description: "« Non » ne supprime que celui-ci.",
        confirmLabel: "Oui, les suivants aussi",
        cancelLabel: "Non",
      }));
    deleteEvent.mutate({ eventId: event.id, withFollowing });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setEditing(true)}>
        <Pencil /> Modifier
      </Button>
      <Button variant="outline" className="flex-1 text-destructive md:flex-none" disabled={deleteEvent.isPending} onClick={remove}>
        <Trash2 /> Supprimer
      </Button>
      <EventFormDialog open={editing} onOpenChange={setEditing} event={event} />
    </div>
  );
}
