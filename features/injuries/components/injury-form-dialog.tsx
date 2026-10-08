"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogClose as DialogClose,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogFooter as DialogFooter,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
  ResponsiveDialogTrigger as DialogTrigger,
} from "@/components/app/responsive-dialog";
import { useAppForm } from "@/lib/form";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { reportInjury, updateInjury } from "../actions";
import { injuryInvalidation } from "../hooks/use-injuries";
import { injurySchema, MIN_INJURY_DAYS, type InjuryValues } from "../schemas";
import type { PlayerInjury } from "../types";

type Props =
  /** Report mode: renders its own "Signaler une blessure" trigger button. */
  | { injury?: undefined; open?: undefined; onOpenChange?: undefined }
  /** Edit mode: opened from the injury's actions menu. */
  | { injury: PlayerInjury; open: boolean; onOpenChange: (open: boolean) => void };

export function InjuryFormDialog({ injury, open, onOpenChange }: Props) {
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = open ?? ownOpen;
  const setOpen = onOpenChange ?? setOwnOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!injury && (
        <DialogTrigger asChild>
          <Button className="font-semibold transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Signaler une blessure
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[550px]">
        <div>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="size-5 text-muted-foreground" aria-hidden />
              {injury ? "Modifier la blessure" : "Nouvelle blessure"}
            </DialogTitle>
            <DialogDescription>
              {injury
                ? "Mets à jour les informations de la blessure."
                : "Ton coach est prévenu et ne te convoque pas jusqu'à ton retour."}
            </DialogDescription>
          </DialogHeader>
        </div>
        {/* Mounted only while open: the form always starts from fresh values */}
        <InjuryForm injury={injury} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function InjuryForm({ injury, onSuccess }: { injury?: PlayerInjury; onSuccess: () => void }) {
  const options = { invalidate: injuryInvalidation, onSuccess };
  const report = useActionMutation(reportInjury, options);
  const update = useActionMutation(updateInjury, options);

  const defaultValues: InjuryValues = {
    type: injury?.type ?? "",
    description: injury?.description ?? "",
    endDate: injury ? new Date(injury.endDate) : addDays(new Date(), MIN_INJURY_DAYS + 1),
  };

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: injurySchema },
    onSubmit: ({ value }) =>
      injury ? update.mutateAsync({ injuryId: injury.id, values: value }) : report.mutateAsync(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Action errors are already shown in a toast by useActionMutation
        form.handleSubmit().catch(() => {});
      }}
      className="p-6 space-y-6"
    >
      <form.AppField name="type">
        {(field) => <field.TextField label="Type de blessure" placeholder="Ex : entorse cheville droite" />}
      </form.AppField>
      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label="Description détaillée"
            placeholder="Expliquez les circonstances et la douleur ressentie..."
            rows={5}
          />
        )}
      </form.AppField>
      <form.AppField name="endDate">{(field) => <field.DateField label="Date de retour estimée" />}</form.AppField>

      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Annuler
          </Button>
        </DialogClose>
        <form.AppForm>
          <form.SubmitButton>{injury ? "Mettre à jour" : "Enregistrer"}</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}
