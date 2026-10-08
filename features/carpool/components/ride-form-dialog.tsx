"use client";

import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/app/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/lib/form";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { offerRide, updateRide } from "../actions";
import { carpoolInvalidation } from "../hooks/use-event-carpool";
import { MAX_SEATS } from "../rules";
import { rideFieldsSchema, type RideFormValues } from "../schemas";
import type { CarpoolRide } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  /** Edit this ride; omitted = offer a new one leaving at `defaultDeparture`. */
  ride?: CarpoolRide;
  defaultDeparture: string;
};

/** The driver's form (bottom sheet on phones): seats, departure place and time, a note. */
export function RideFormDialog({ open, onOpenChange, ...props }: Props) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{props.ride ? "Modifier ma voiture" : "Je propose ma voiture"}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>Tes coéquipiers réservent une place, tu es prévenu à chaque réservation.</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {open && <RideForm {...props} onDone={() => onOpenChange(false)} />}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function RideForm({ eventId, ride, defaultDeparture, onDone }: Omit<Props, "open" | "onOpenChange"> & { onDone: () => void }) {
  const options = { invalidate: carpoolInvalidation, onSuccess: onDone };
  const offer = useActionMutation(offerRide, options);
  const update = useActionMutation(updateRide, options);

  const defaultValues: RideFormValues = ride
    ? { seats: ride.seats, departurePlace: ride.departurePlace, departureTime: new Date(ride.departureTime), note: ride.note ?? "" }
    : { seats: 3, departurePlace: "", departureTime: new Date(defaultDeparture), note: "" };

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: rideFieldsSchema },
    onSubmit: ({ value }) =>
      (ride ? update.mutateAsync({ ...value, rideId: ride.id }) : offer.mutateAsync({ ...value, eventId })).catch(() => undefined),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="seats">
        {(field) => (
          <field.NumberField label="Places libres" min={1} max={MAX_SEATS} description={`Sans compter le conducteur, ${MAX_SEATS} maximum.`} />
        )}
      </form.AppField>
      <form.AppField name="departurePlace">
        {(field) => <field.TextField label="Lieu de départ" placeholder="Parking du stade, place de la mairie..." />}
      </form.AppField>
      <form.AppField name="departureTime">{(field) => <field.DateField label="Départ" withTime />}</form.AppField>
      <form.AppField name="note">
        {(field) => <field.TextareaField label="Note (facultatif)" placeholder="Je passe par la gare, 2 € pour l'essence..." rows={2} />}
      </form.AppField>
      <ResponsiveDialogFooter className="gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onDone}>
          Annuler
        </Button>
        <form.AppForm>
          <form.SubmitButton>{ride ? "Enregistrer" : "Proposer ma voiture"}</form.SubmitButton>
        </form.AppForm>
      </ResponsiveDialogFooter>
    </form>
  );
}
