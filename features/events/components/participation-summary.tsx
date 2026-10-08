"use client";

import { CircleCheck, CircleHelp, CircleX, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CallUpPickerDialog } from "@/features/call-ups/components/call-up-picker";
import { CALL_UP_RULES } from "@/features/call-ups/server/rules";

type CallUpCounts = { confirmed: number; pending: number; declined: number; players: number; canSend: boolean };

function Count({ icon: Icon, value, label, className }: { icon: typeof CircleCheck; value: number; label: string; className: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className={cn("size-4", className)} aria-hidden />
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

/**
 * Coach side of a match: "8 présents · 3 en attente · 2 absents" and the "Convoquer" button
 * (shared by the home, the agenda and the event page).
 */
export function CallUpSummary({
  eventId,
  title,
  counts,
  compact,
  className,
}: {
  eventId: string;
  title: string;
  counts: CallUpCounts;
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const sent = counts.confirmed + counts.pending + counts.declined;
  const notCalled = Math.max(0, counts.players - sent);

  return (
    <div className={cn("space-y-3", className)} data-tour="home-callup-summary">
      {sent > 0 ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Réponses aux convocations">
          <Count icon={CircleCheck} value={counts.confirmed} label={counts.confirmed > 1 ? "présents" : "présent"} className="text-success" />
          <Count icon={CircleHelp} value={counts.pending} label="en attente" className="text-warning" />
          <Count icon={CircleX} value={counts.declined} label={counts.declined > 1 ? "absents" : "absent"} className="text-destructive" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Personne n&apos;est encore convoqué.</p>
      )}
      {counts.canSend && notCalled > 0 ? (
        <>
          <Button className={cn(!compact && "w-full sm:w-auto")} variant={sent > 0 ? "outline" : "default"} onClick={() => setOpen(true)}>
            <Send /> {sent > 0 ? `Convoquer d'autres joueurs (${notCalled})` : "Convoquer les joueurs"}
          </Button>
          <CallUpPickerDialog eventId={eventId} title={title} open={open} onOpenChange={setOpen} />
        </>
      ) : (
        !counts.canSend &&
        sent === 0 && (
          <p className="text-xs text-muted-foreground">
            Les convocations s&apos;envoient au plus tard {CALL_UP_RULES.sendMinHours}h avant le match.
          </p>
        )
      )}
    </div>
  );
}

/** Coach side of a training: present / absent counts. */
export function AttendanceSummary({ counts }: { counts: { present: number; absent: number; players: number } }) {
  const unknown = Math.max(0, counts.players - counts.present - counts.absent);
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-label="Présences annoncées">
      <Count icon={CircleCheck} value={counts.present} label={counts.present > 1 ? "viennent" : "vient"} className="text-success" />
      <Count icon={CircleX} value={counts.absent} label="absents" className="text-destructive" />
      <Count icon={CircleHelp} value={unknown} label="sans réponse" className="text-muted-foreground" />
    </div>
  );
}
