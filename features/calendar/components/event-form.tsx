"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { EVENT_TYPE_KEYS, EVENT_TYPES } from "@/features/events/event-types";
import { useCreateEvent, useUpdateEvent } from "@/features/events/hooks/use-event-actions";
import { weeklyOccurrences } from "@/features/events/recurrence";
import { type EventFormValues, eventFormSchema } from "@/features/events/schemas";
import type { EventListItem } from "@/features/events/types";
import { useAppForm } from "@/lib/form";

const typeOptions = EVENT_TYPE_KEYS.map((type) => ({ value: type, label: EVENT_TYPES[type].label }));

type Props = {
  /** Event to edit; omitted to create one starting at `defaultStart`. */
  event?: EventListItem;
  defaultStart?: Date;
  onDone: () => void;
  onCancel: () => void;
};

/** Create / edit form of an event (same zod schema as the server actions). */
export function EventForm({ event, defaultStart, onDone, onCancel }: Props) {
  const createEvent = useCreateEvent(onDone);
  const updateEvent = useUpdateEvent(onDone);

  // `repeat` only drives the UI: `repeatUntil` is sent when it is checked.
  const defaultValues: EventFormValues = event
    ? {
        repeat: false,
        title: event.title,
        type: event.type,
        startDate: new Date(event.startDate),
        location: event.location ?? "",
        opponent: event.opponent ?? "",
      }
    : { repeat: false, title: "", type: "TRAINING", startDate: defaultStart ?? new Date(), location: "", opponent: "" };

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: eventFormSchema },
    // Errors are already shown as toasts by useActionMutation
    onSubmit: ({ value: { repeat, repeatUntil, ...value } }) =>
      (event
        ? updateEvent.mutateAsync({ ...value, eventId: event.id })
        : createEvent.mutateAsync({ ...value, repeatUntil: repeat ? repeatUntil : undefined })
      ).catch(() => undefined),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="title">
        {(field) => <field.TextField label="Titre" placeholder="Ex : Entraînement tactique" />}
      </form.AppField>
      <form.AppField
        name="type"
        listeners={{
          // Only trainings repeat: reset the hidden repetition fields so they can't block the submit
          onChange: ({ value }) => {
            if (value === "TRAINING") return;
            form.setFieldValue("repeat", false);
            form.setFieldValue("repeatUntil", undefined);
          },
        }}
      >
        {(field) => <field.SelectField label="Type" options={typeOptions} />}
      </form.AppField>
      <form.AppField name="startDate">{(field) => <field.DateField label="Date et heure" withTime />}</form.AppField>
      <form.AppField name="location">
        {(field) => <field.TextField label="Lieu" placeholder="Stade municipal" />}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.type}>
        {(type) =>
          type !== "TRAINING" && (
            <form.AppField name="opponent">
              {(field) => <field.TextField label="Adversaire" placeholder="Nom de l'équipe adverse" />}
            </form.AppField>
          )
        }
      </form.Subscribe>
      {!event && (
        <form.Subscribe selector={({ values }) => values}>
          {({ type, repeat, startDate, repeatUntil }) =>
            type === "TRAINING" && (
              <>
                <form.AppField
                  name="repeat"
                  listeners={{ onChange: ({ value }) => !value && form.setFieldValue("repeatUntil", undefined) }}
                >
                  {(field) => <field.CheckboxField label="Répéter chaque semaine" />}
                </form.AppField>
                {repeat && (
                  <form.AppField name="repeatUntil">
                    {(field) => (
                      <field.DateField
                        label="Jusqu'au"
                        description={
                          repeatUntil && repeatUntil > startDate
                            ? `${weeklyOccurrences(startDate, repeatUntil).length} entraînements seront créés`
                            : "Dernier jour de la répétition (un an maximum)"
                        }
                      />
                    )}
                  </form.AppField>
                )}
              </>
            )
          }
        </form.Subscribe>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <form.AppForm>
          <form.SubmitButton>Enregistrer</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}
