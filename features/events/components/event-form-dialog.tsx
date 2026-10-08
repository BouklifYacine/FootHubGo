"use client";

import { useState } from "react";
import { PartyPopper, Send } from "lucide-react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/app/responsive-dialog";
import { Button } from "@/components/ui/button";
import { CallUpPicker } from "@/features/call-ups/components/call-up-picker";
import { EventForm, type EditableEvent, type ScopeOption } from "@/features/calendar/components/event-form";

type Created = { eventId: string; type: string; title: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this event; omitted = create one (starting at `defaultStart`). */
  event?: EditableEvent;
  defaultStart?: Date;
  scopeOptions?: ScopeOption[];
};

/**
 * Create / edit an event in a dialog (bottom sheet on phones). After a match is created, offers to
 * call the players up right away.
 */
export function EventFormDialog({ open, onOpenChange, event, defaultStart, scopeOptions }: Props) {
  const [created, setCreated] = useState<Created | null>(null);
  const [step, setStep] = useState<"form" | "created" | "call-ups">("form");
  const close = () => {
    onOpenChange(false);
    setStep("form");
    setCreated(null);
  };

  const title =
    step === "call-ups" ? "Convoquer les joueurs" : step === "created" ? "Match créé" : event ? "Modifier l'événement" : "Nouvel événement";

  return (
    <ResponsiveDialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className={step === "form" ? "sr-only" : undefined}>
            {step === "form" ? title : "Les joueurs sont prévenus tout de suite et répondent depuis leur téléphone."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {open && step === "form" && (
          <EventForm
            event={event}
            defaultStart={defaultStart}
            scopeOptions={scopeOptions}
            onCancel={close}
            onDone={(result) => {
              if (result && result.type !== "TRAINING") {
                setCreated(result);
                setStep("created");
              } else close();
            }}
          />
        )}
        {step === "created" && created && (
          <>
            <p className="flex items-center gap-2 text-sm">
              <PartyPopper className="size-5 text-success" aria-hidden /> « {created.title} » est dans l&apos;agenda. Convoque tes
              joueurs maintenant ?
            </p>
            <ResponsiveDialogFooter className="gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={close}>
                Plus tard
              </Button>
              <Button onClick={() => setStep("call-ups")}>
                <Send /> Convoquer maintenant
              </Button>
            </ResponsiveDialogFooter>
          </>
        )}
        {step === "call-ups" && created && <CallUpPicker eventId={created.eventId} backLabel="Plus tard" onBack={close} onSent={close} />}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
