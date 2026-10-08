"use client";

import { Check, CircleCheck, CircleX, Lock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import { setAttendance } from "@/features/events/actions";
import { replyToCallUp } from "../actions";
import { participationInvalidation } from "../invalidation";

type CallUp = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "DECLINED" | "EXPIRED";
  canReply: boolean;
  deadline: string;
};

/**
 * The player's answer to a call-up ("Je suis dispo" / "Pas dispo"), shared by the home, the agenda
 * and the event page. The answer can be changed until the deadline (3h before the match).
 */
export function CallUpAnswer({ callUp, compact, className }: { callUp: CallUp; compact?: boolean; className?: string }) {
  const reply = useActionMutation(replyToCallUp, { invalidate: participationInvalidation });
  const status = reply.isPending && reply.variables ? reply.variables.status : callUp.status;

  if (!callUp.canReply) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2 text-sm", className)} data-tour="callup-answer">
        <CallUpStatusBadge status={status} />
        <span className="flex items-center gap-1 text-muted-foreground">
          <Lock className="size-3.5" aria-hidden /> Réponses closes
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)} data-tour="callup-answer">
      {!compact && status === "PENDING" && <p className="text-sm font-medium">Tu es convoqué. Tu es dispo ?</p>}
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Ma réponse à la convocation">
        <AnswerButton
          selected={status === "CONFIRMED"}
          tone="yes"
          disabled={reply.isPending}
          onClick={() => status !== "CONFIRMED" && reply.mutate({ callUpId: callUp.id, status: "CONFIRMED" })}
        >
          Je suis dispo
        </AnswerButton>
        <AnswerButton
          selected={status === "DECLINED"}
          tone="no"
          disabled={reply.isPending}
          onClick={() => status !== "DECLINED" && reply.mutate({ callUpId: callUp.id, status: "DECLINED" })}
        >
          Pas dispo
        </AnswerButton>
      </div>
      <p className="text-xs text-muted-foreground">
        {status === "PENDING" ? "Réponds avant le " : "Tu peux changer d'avis jusqu'au "}
        {formatDateTime(callUp.deadline)}.
      </p>
    </div>
  );
}

/** A training: "Je viens" / "Je ne viens pas" (players of the section, until the start). */
export function AttendanceAnswer({
  eventId,
  status,
  canAnswer,
  className,
}: {
  eventId: string;
  status: "PENDING" | "PRESENT" | "ABSENT";
  canAnswer: boolean;
  className?: string;
}) {
  const answer = useActionMutation(setAttendance, { invalidate: participationInvalidation });
  const current = answer.isPending && answer.variables ? answer.variables.status : status;

  if (!canAnswer) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        {current === "PRESENT" ? "Tu étais présent." : current === "ABSENT" ? "Tu étais absent." : "Pas de réponse."}
      </div>
    );
  }
  return (
    <div className={cn("space-y-2", className)} data-tour="attendance-answer">
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Ma présence à l'entraînement">
        <AnswerButton
          selected={current === "PRESENT"}
          tone="yes"
          disabled={answer.isPending}
          onClick={() => current !== "PRESENT" && answer.mutate({ eventId, status: "PRESENT" })}
        >
          Je viens
        </AnswerButton>
        <AnswerButton
          selected={current === "ABSENT"}
          tone="no"
          disabled={answer.isPending}
          onClick={() => current !== "ABSENT" && answer.mutate({ eventId, status: "ABSENT" })}
        >
          Je ne viens pas
        </AnswerButton>
      </div>
      {current === "PENDING" && <p className="text-xs text-muted-foreground">Préviens ton coach : ça l&apos;aide à préparer la séance.</p>}
    </div>
  );
}

function AnswerButton({
  selected,
  tone,
  children,
  ...props
}: { selected: boolean; tone: "yes" | "no"; children: string } & Omit<React.ComponentProps<typeof Button>, "children">) {
  const Icon = tone === "yes" ? Check : X;
  return (
    <Button
      type="button"
      aria-pressed={selected}
      variant={selected ? (tone === "yes" ? "success" : "destructive") : "outline"}
      className={cn("h-12 text-base font-semibold md:h-10", !selected && "text-foreground")}
      {...props}
    >
      <Icon aria-hidden /> {children}
    </Button>
  );
}

/** Status chip of a call-up, icon + text (coach and player side). */
export function CallUpStatusBadge({ status, playerView = true }: { status: CallUp["status"]; playerView?: boolean }) {
  if (status === "CONFIRMED") {
    return (
      <Badge variant="success">
        <CircleCheck aria-hidden /> {playerView ? "Dispo" : "Présent"}
      </Badge>
    );
  }
  if (status === "DECLINED") {
    return (
      <Badge variant="danger">
        <CircleX aria-hidden /> {playerView ? "Pas dispo" : "Absent"}
      </Badge>
    );
  }
  if (status === "EXPIRED") return <Badge variant="muted">Sans réponse</Badge>;
  return <Badge variant="warning">En attente</Badge>;
}
