"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useAppForm } from "@/lib/form";
import { teamLevelLabels, teamVisibilityLabels, toOptions } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import type { TeamLevel, TeamVisibility } from "@/generated/prisma/browser";
import { createTeam, updateTeam } from "../actions/team-actions";
import { teamSchema, type TeamInput } from "../schemas";

const levelOptions = toOptions(teamLevelLabels);
const visibilityOptions = toOptions(teamVisibilityLabels);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when given, create mode otherwise. */
  team?: TeamInput;
};

export function TeamFormDialog({ open, onOpenChange, team }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{team ? "Modifier le club" : "Créer un club"}</DialogTitle>
          <DialogDescription>
            {team
              ? "Mettez à jour les informations de votre club."
              : "Remplissez le formulaire pour créer votre club. Vous en serez l'entraîneur."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts fresh every time. */}
        <TeamForm team={team} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TeamForm({ team, onDone }: { team?: TeamInput; onDone: () => void }) {
  const router = useRouter();
  const invalidate = [queryKeys.me.all, queryKeys.home, queryKeys.teams.all];
  const create = useActionMutation(createTeam, {
    invalidate,
    onSuccess: () => {
      onDone();
      router.push("/app/squad");
    },
  });
  const update = useActionMutation(updateTeam, { invalidate, onSuccess: onDone });

  const form = useAppForm({
    defaultValues: {
      name: team?.name ?? "",
      description: team?.description ?? "",
      level: team?.level as TeamLevel | undefined,
      visibility: (team?.visibility ?? "PUBLIC") as TeamVisibility,
    },
    validators: { onSubmit: teamSchema },
    onSubmit: async ({ value }) => {
      const input = teamSchema.parse(value);
      await (team ? update : create).mutateAsync(input).catch(() => undefined);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.AppField name="name">
        {(field) => <field.TextField label="Nom du club *" placeholder="Nom du club" />}
      </form.AppField>
      <form.AppField name="level">
        {(field) => (
          <field.SelectField label="Niveau *" options={levelOptions} placeholder="Choisir un niveau" />
        )}
      </form.AppField>
      <form.AppField name="visibility">
        {(field) => (
          <field.SelectField
            label="Visibilité *"
            options={visibilityOptions}
            description="Seuls les clubs publics reçoivent des demandes d'adhésion."
          />
        )}
      </form.AppField>
      <form.AppField name="description">
        {(field) => <field.TextareaField label="Description" placeholder="Présentez votre club" rows={3} />}
      </form.AppField>
      <DialogFooter>
        <form.AppForm>
          <form.SubmitButton>{team ? "Enregistrer" : "Créer"}</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}
