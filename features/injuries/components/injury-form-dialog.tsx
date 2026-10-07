"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border-none shadow-2xl dark:bg-zinc-950/95 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
        <div className="px-6 py-6 border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              {injury ? "Modifier la blessure" : "Nouvelle blessure"}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {injury
                ? "Mettez à jour les informations de la blessure."
                : "Remplissez les informations ci-dessous pour informer le staff."}
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

      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 border-t dark:border-zinc-800">
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
