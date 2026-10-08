"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
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
import { playerPositionLabels, toOptions } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { createPlayerStats, updatePlayerStats } from "../actions";
import { statsInvalidation } from "../hooks/use-event-stats";
import { playerStatsFormSchema, type PlayerStatsFormValues } from "../schemas";
import type { EligiblePlayer, EventPlayerStat } from "../types";

type Props =
  /** Add mode: pick one of these players (a single player is preselected). */
  | { eventId: string; players: EligiblePlayer[]; stat?: undefined }
  /** Edit mode. */
  | { eventId: string; stat: EventPlayerStat; players?: undefined };

/** Round "+" (add) or pencil (edit) button opening the player stats form. */
export function PlayerStatsDialog(props: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = !!props.stat;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label={isEdit ? "Modifier les stats du joueur" : "Ajouter des stats joueur"}
        >
          {isEdit ? <Pencil size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {props.stat ? `Modifier les stats de ${props.stat.user.name}` : "Ajouter les stats joueur"}
          </DialogTitle>
          <DialogDescription>Les statistiques du joueur sur ce match.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open: the form always starts from fresh values */}
        <PlayerStatsForm {...props} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function PlayerStatsForm({ eventId, stat, players = [], onSuccess }: Props & { onSuccess: () => void }) {
  const invalidate = { invalidate: statsInvalidation, onSuccess };
  const create = useActionMutation(createPlayerStats, invalidate);
  const update = useActionMutation(updatePlayerStats, invalidate);

  const preselected = players.length === 1 ? players[0] : undefined;
  const defaultValues: PlayerStatsFormValues = stat
    ? {
        userId: stat.userId,
        position: stat.position,
        goals: stat.goals,
        assists: stat.assists,
        minutesPlayed: stat.minutesPlayed,
        rating: stat.rating,
        isStarter: stat.isStarter,
      }
    : {
        userId: preselected?.userId ?? "",
        position: preselected?.position ?? "GOALKEEPER",
        goals: 0,
        assists: 0,
        minutesPlayed: 90,
        rating: 6,
        isStarter: true,
      };

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: playerStatsFormSchema },
    onSubmit: ({ value: { userId, ...values } }) =>
      stat
        ? update.mutateAsync({ statId: stat.id, values })
        : create.mutateAsync({ eventId, userId, values }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Action errors are already shown in a toast by useActionMutation
        form.handleSubmit().catch(() => {});
      }}
      className="space-y-4"
    >
      {!stat && (
        <form.AppField
          name="userId"
          listeners={{
            // Default the position to the player's usual one
            onChange: ({ value }) => {
              const position = players.find((player) => player.userId === value)?.position;
              if (position) form.setFieldValue("position", position);
            },
          }}
        >
          {(field) => (
            <field.SelectField
              label="Joueur"
              placeholder="Choisir un joueur"
              options={players.map((player) => ({ value: player.userId, label: player.user.name }))}
            />
          )}
        </form.AppField>
      )}
      <form.AppField name="position">
        {(field) => <field.SelectField label="Poste" options={toOptions(playerPositionLabels)} />}
      </form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="goals">
          {(field) => <field.NumberField label="Buts" min={0} max={99} />}
        </form.AppField>
        <form.AppField name="assists">
          {(field) => <field.NumberField label="Passes décisives" min={0} max={99} />}
        </form.AppField>
        <form.AppField name="minutesPlayed">
          {(field) => <field.NumberField label="Minutes jouées" min={0} max={90} />}
        </form.AppField>
        <form.AppField name="rating">
          {(field) => <field.NumberField label="Note" min={0} max={10} step={0.1} />}
        </form.AppField>
      </div>
      <form.AppField name="isStarter">{(field) => <field.CheckboxField label="Titulaire" />}</form.AppField>

      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Annuler
          </Button>
        </DialogClose>
        <form.AppForm>
          <form.SubmitButton>Enregistrer les stats</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}
