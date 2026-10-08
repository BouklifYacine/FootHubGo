"use client";

import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/app/segmented-control";
import { ResponsiveDialogFooter } from "@/components/app/responsive-dialog";
import { CALL_UP_RULES } from "@/features/call-ups/server/rules";
import { EVENT_TYPE_KEYS, EVENT_TYPES } from "@/features/events/event-types";
import { useCreateEvent, useUpdateEvent } from "@/features/events/hooks/use-event-actions";
import { weeklyOccurrences } from "@/features/events/recurrence";
import { type EventFormValues, eventFormSchema } from "@/features/events/schemas";
import type { EventListItem } from "@/features/events/types";
import { useAppForm } from "@/lib/form";

const typeOptions = EVENT_TYPE_KEYS.map((type) => ({ value: type, label: EVENT_TYPES[type].label }));

/** What the form edits (an agenda item or the event page data both fit). */
export type EditableEvent = Pick<
  EventListItem,
  "id" | "title" | "type" | "startDate" | "location" | "opponent" | "description" | "isHome"
>;

/** "CLUB" (whole club) or a section id. */
export type ScopeOption = { value: string; label: string };

type Props = {
  /** Event to edit; omitted to create one starting at `defaultStart`. */
  event?: EditableEvent;
  defaultStart?: Date;
  /** Club OWNER / ADMIN: who the new event is for (the first option is the default). */
  scopeOptions?: ScopeOption[];
  /** Called after a save; `created` is the new event (creation only). */
  onDone: (created?: { eventId: string; type: string; title: string }) => void;
  onCancel: () => void;
};

/** Create / edit form of an event (same zod schema as the server actions). */
export function EventForm({ event, defaultStart, scopeOptions, onDone, onCancel }: Props) {
  const createEvent = useCreateEvent(onDone);
  const updateEvent = useUpdateEvent(() => onDone());

  // `repeat` only drives the UI: `repeatUntil` is sent when it is checked.
  const defaultValues: EventFormValues = event
    ? {
        repeat: false,
        title: event.title,
        type: event.type,
        startDate: new Date(event.startDate),
        location: event.location ?? "",
        opponent: event.opponent ?? "",
        description: event.description ?? "",
        isHome: event.isHome,
      }
    : {
        repeat: false,
        title: "",
        type: "TRAINING",
        startDate: defaultStart ?? new Date(),
        location: "",
        opponent: "",
        description: "",
        isHome: true,
        scope: scopeOptions?.[0]?.value,
      };

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: eventFormSchema },
    // Errors are already shown as toasts by useActionMutation
    onSubmit: ({ value: { repeat, repeatUntil, scope, ...value } }) =>
      (event
        ? updateEvent.mutateAsync({ ...value, eventId: event.id })
        : createEvent.mutateAsync({ ...value, scope, repeatUntil: repeat ? repeatUntil : undefined })
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
      {!event && scopeOptions && scopeOptions.length > 1 && (
        <form.AppField name="scope">
          {(field) => <field.SelectField label="Pour" options={scopeOptions} />}
        </form.AppField>
      )}
      <form.AppField name="title">
        {(field) => <field.TextField label="Titre" placeholder="Ex. Entraînement, Match J5" />}
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
        {(field) => (
          <field.SelectField
            label="Type"
            options={typeOptions}
            description={
              field.state.value === "TRAINING"
                ? undefined
                : `Les convocations s'envoient jusqu'à ${CALL_UP_RULES.sendMinHours}h avant le match.`
            }
          />
        )}
      </form.AppField>
      <form.AppField name="startDate">{(field) => <field.DateField label="Date et heure" withTime />}</form.AppField>
      <form.AppField name="location">
        {(field) => <field.TextField label="Lieu" placeholder="Stade municipal" />}
      </form.AppField>
      <form.AppField name="description">
        {(field) => <field.TextareaField label="Description" placeholder="Consignes, matériel, horaire du rendez-vous..." rows={3} />}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.type}>
        {(type) =>
          type !== "TRAINING" && (
            <>
              <form.AppField name="opponent">
                {(field) => <field.TextField label="Adversaire" placeholder="Nom de l'équipe adverse" />}
              </form.AppField>
              <form.AppField name="isHome">
                {(field) => (
                  <div className="space-y-1.5">
                    <span className="text-sm font-medium">
                      Lieu du match
                    </span>
                    <SegmentedControl
                      label="Lieu du match"
                      className="w-full"
                      value={field.state.value === false ? "away" : "home"}
                      onChange={(venue) => field.handleChange(venue === "home")}
                      options={[
                        { value: "home", label: "Domicile" },
                        { value: "away", label: "Extérieur" },
                      ]}
                    />
                    {field.state.value === false && (
                      <p className="text-xs text-muted-foreground">Le covoiturage s&apos;ouvre sur la page du match.</p>
                    )}
                  </div>
                )}
              </form.AppField>
            </>
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

      <ResponsiveDialogFooter className="gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <form.AppForm>
          <form.SubmitButton>{event ? "Enregistrer" : "Créer l'événement"}</form.SubmitButton>
        </form.AppForm>
      </ResponsiveDialogFooter>
    </form>
  );
}
