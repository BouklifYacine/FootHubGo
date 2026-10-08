"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogFooter as DialogFooter,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
  ResponsiveDialogTrigger as DialogTrigger,
} from "@/components/app/responsive-dialog";
import { useAppForm } from "@/lib/form";
import { useCreatePoll } from "../hooks/use-polls";
import {
  type CreatePollInput,
  createPollSchema,
  POLL_MAX_OPTIONS,
} from "../schemas";

const defaultValues: CreatePollInput = {
  question: "",
  options: ["", ""],
  isMulti: false,
  expiresAt: undefined,
};

/** Coach: publishes a poll to the whole team (everyone gets a notification). */
export function CreatePollDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Nouveau sondage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Nouveau sondage</DialogTitle>
        </DialogHeader>
        {/* Unmounted when the dialog closes: the form starts empty every time */}
        <CreatePollForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreatePollForm({ onDone }: { onDone: () => void }) {
  const createPoll = useCreatePoll(onDone);
  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: createPollSchema },
    onSubmit: ({ value }) =>
      createPoll.mutateAsync(value).catch(() => undefined),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="question">
        {(field) => (
          <field.TextField
            label="Question"
            placeholder="Ex : Dispo pour le match amical samedi ?"
          />
        )}
      </form.AppField>

      <form.Field mode="array" name="options">
        {(optionsField) => (
          <div className="space-y-2">
            {optionsField.state.value.map((_, index) => (
              <div className="flex items-end gap-2" key={index}>
                <form.AppField name={`options[${index}]`}>
                  {(field) => (
                    <field.TextField
                      className="flex-1"
                      label={`Option ${index + 1}`}
                    />
                  )}
                </form.AppField>
                {optionsField.state.value.length > 2 && (
                  <Button
                    aria-label={`Retirer l'option ${index + 1}`}
                    onClick={() => optionsField.removeValue(index)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            {optionsField.state.value.length < POLL_MAX_OPTIONS && (
              <Button
                onClick={() => optionsField.pushValue("")}
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus /> Ajouter une option
              </Button>
            )}
          </div>
        )}
      </form.Field>

      <form.AppField name="isMulti">
        {(field) => <field.CheckboxField label="Plusieurs choix possibles" />}
      </form.AppField>
      <form.AppField name="expiresAt">
        {(field) => (
          <field.DateField
            description="Optionnel : sans date, le sondage reste ouvert"
            label="Fin du sondage"
            withTime
          />
        )}
      </form.AppField>

      <DialogFooter>
        <form.AppForm>
          <form.SubmitButton>Publier</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}
