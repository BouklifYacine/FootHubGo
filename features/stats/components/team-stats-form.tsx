"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import type { Competition } from "@/generated/prisma/browser";
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
import { competitionLabels, matchResultLabels, toOptions } from "@/lib/enum-labels";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { createTeamStats, updateTeamStats } from "../actions";
import { statsInvalidation } from "../hooks/use-event-stats";
import { teamStatsSchema, type TeamStatsValues } from "../schemas";
import type { EventTeamStat } from "../types";

type Props = {
  eventId: string;
  /** Edit mode when set. */
  teamStat?: EventTeamStat | null;
  defaultCompetition: Competition;
  /** Home / away of the event (the form's default for a new score). */
  defaultIsHome?: boolean;
};

/** "Add" or "Edit" button opening the team stats form of a match. */
export function TeamStatsDialog(props: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = !!props.teamStat;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline">
            <Pencil aria-hidden /> Modifier le score
          </Button>
        ) : (
          <Button>
            <Plus aria-hidden /> Saisir le score
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier le score" : "Saisir le score"}
          </DialogTitle>
          <DialogDescription>Le score et les statistiques de ton équipe sur ce match.</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open: the form always starts from fresh values */}
        <TeamStatsForm {...props} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TeamStatsForm({ eventId, teamStat, defaultCompetition, defaultIsHome = true, onSuccess }: Props & { onSuccess: () => void }) {
  const mutation = useActionMutation(teamStat ? updateTeamStats : createTeamStats, {
    invalidate: statsInvalidation,
    onSuccess,
  });

  const defaultValues: TeamStatsValues = teamStat
    ? {
        result: teamStat.result,
        goalsFor: teamStat.goalsFor,
        goalsAgainst: teamStat.goalsAgainst,
        totalShots: teamStat.totalShots ?? undefined,
        shotsOnTarget: teamStat.shotsOnTarget ?? undefined,
        isHome: teamStat.isHome,
        competition: teamStat.competition,
      }
    : {
        result: "WIN",
        goalsFor: 0,
        goalsAgainst: 0,
        totalShots: undefined,
        shotsOnTarget: undefined,
        isHome: defaultIsHome,
        competition: defaultCompetition,
      };

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: teamStatsSchema },
    onSubmit: ({ value }) => mutation.mutateAsync({ eventId, values: value }),
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
      <form.AppField name="result">
        {(field) => <field.SelectField label="Résultat du match" options={toOptions(matchResultLabels)} />}
      </form.AppField>
      <div className="grid grid-cols-2 gap-4">
        <form.AppField name="goalsFor">
          {(field) => <field.NumberField label="Buts marqués" min={0} max={99} />}
        </form.AppField>
        <form.AppField name="goalsAgainst">
          {(field) => <field.NumberField label="Buts encaissés" min={0} max={99} />}
        </form.AppField>
        <form.AppField name="totalShots">
          {(field) => <field.NumberField label="Tirs totaux" min={0} max={99} placeholder="Optionnel" />}
        </form.AppField>
        <form.AppField name="shotsOnTarget">
          {(field) => <field.NumberField label="Tirs cadrés" min={0} max={99} placeholder="Optionnel" />}
        </form.AppField>
      </div>
      <form.AppField name="competition">
        {(field) => <field.SelectField label="Compétition" options={toOptions(competitionLabels)} />}
      </form.AppField>
      <form.AppField name="isHome">{(field) => <field.CheckboxField label="Match à domicile" />}</form.AppField>

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
