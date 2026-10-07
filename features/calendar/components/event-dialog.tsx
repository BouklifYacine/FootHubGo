"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CallUpPicker } from "@/features/call-ups/components/call-up-picker";
import type { EventListItem } from "@/features/events/types";
import { EventDetails } from "./event-details";
import { EventForm, type ScopeOption } from "./event-form";

export type EventDialogState = { mode: "create"; start: Date } | { mode: "view"; event: EventListItem } | null;

type Props = { state: EventDialogState; scopeOptions?: ScopeOption[]; onClose: () => void };

type ViewStep = "details" | "edit" | "call-ups";

/** One dialog for the calendar: create, view, then edit an event or call players up. */
export function EventDialog({ state, scopeOptions, onClose }: Props) {
  const [step, setStep] = useState<ViewStep>("details");
  const close = () => {
    setStep("details");
    onClose();
  };
  const back = () => setStep("details");

  const mode = state?.mode === "view" && step !== "details" ? step : state?.mode;
  const title = {
    create: "Créer un événement",
    edit: "Modifier l'événement",
    "call-ups": "Convoquer des joueurs",
    view: "Détails de l'événement",
  };

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode && title[mode]}</DialogTitle>
          <DialogDescription className="sr-only">{mode && title[mode]}</DialogDescription>
        </DialogHeader>

        {state?.mode === "create" && <EventForm defaultStart={state.start} scopeOptions={scopeOptions} onDone={close} onCancel={close} />}
        {state?.mode === "view" && step === "edit" && <EventForm event={state.event} onDone={close} onCancel={back} />}
        {state?.mode === "view" && step === "call-ups" && <CallUpPicker eventId={state.event.id} onBack={back} />}
        {state?.mode === "view" && step === "details" && (
          <EventDetails
            event={state.event}
            onEdit={() => setStep("edit")}
            onCallUps={() => setStep("call-ups")}
            onDeleted={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
