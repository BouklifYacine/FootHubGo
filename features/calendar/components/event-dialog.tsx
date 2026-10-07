"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EventListItem } from "@/features/events/types";
import { EventDetails } from "./event-details";
import { EventForm } from "./event-form";

export type EventDialogState = { mode: "create"; start: Date } | { mode: "view"; event: EventListItem } | null;

type Props = { state: EventDialogState; canEdit: boolean; onClose: () => void };

/** One dialog for the calendar: create, view, then edit an event. */
export function EventDialog({ state, canEdit, onClose }: Props) {
  const [editing, setEditing] = useState(false);
  const close = () => {
    setEditing(false);
    onClose();
  };

  const mode = state?.mode === "view" && editing ? "edit" : state?.mode;
  const title = { create: "Créer un événement", edit: "Modifier l'événement", view: "Détails de l'événement" };

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode && title[mode]}</DialogTitle>
          <DialogDescription className="sr-only">{mode && title[mode]}</DialogDescription>
        </DialogHeader>

        {state?.mode === "create" && <EventForm defaultStart={state.start} onDone={close} onCancel={close} />}
        {state?.mode === "view" &&
          (editing ? (
            <EventForm event={state.event} onDone={close} onCancel={() => setEditing(false)} />
          ) : (
            <EventDetails event={state.event} canEdit={canEdit} onEdit={() => setEditing(true)} onDeleted={close} />
          ))}
      </DialogContent>
    </Dialog>
  );
}
