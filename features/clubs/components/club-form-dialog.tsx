"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppForm } from "@/lib/form";
import { clubVisibilityLabels, sectionCategoryLabels, teamLevelLabels, toOptions } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import type { ClubVisibility, SectionCategory, TeamLevel } from "@/generated/prisma/browser";
import { createClub, updateClub } from "../actions";
import { useRefreshAll } from "../hooks/use-refresh-all";
import { clubSchema, createClubSchema, type ClubInput } from "../schemas";

const levelOptions = toOptions(teamLevelLabels);
const visibilityOptions = toOptions(clubVisibilityLabels);
const categoryOptions = toOptions(sectionCategoryLabels);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode (club information) when given; create mode (club + first section) otherwise. */
  club?: ClubInput;
};

export function ClubFormDialog({ open, onOpenChange, club }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-md overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{club ? "Modifier le club" : "Créer un club"}</DialogTitle>
          <DialogDescription>
            {club
              ? "Mettez à jour les informations de votre club."
              : "Créez votre club et sa première section. Vous en serez le propriétaire et l'entraîneur."}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts fresh every time. */}
        {club ? (
          <EditClubForm club={club} onDone={() => onOpenChange(false)} />
        ) : (
          <CreateClubForm onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateClubForm({ onDone }: { onDone: () => void }) {
  const refreshAll = useRefreshAll();
  const create = useActionMutation(createClub, {
    onSuccess: () => {
      onDone();
      refreshAll("/app/squad");
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      description: "",
      visibility: "PUBLIC" as ClubVisibility,
      sectionName: "Seniors",
      category: "SENIOR" as SectionCategory,
      level: undefined as TeamLevel | undefined,
    },
    validators: { onSubmit: createClubSchema },
    onSubmit: async ({ value }) => {
      await create.mutateAsync(createClubSchema.parse(value)).catch(() => undefined);
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
        {(field) => <field.TextField label="Nom du club *" placeholder="FC Exemple" />}
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
        {(field) => <field.TextareaField label="Description" placeholder="Présentez votre club" rows={2} />}
      </form.AppField>
      <p className="pt-2 text-sm font-medium">Première section</p>
      <form.AppField name="sectionName">
        {(field) => <field.TextField label="Nom de la section *" placeholder="Seniors A" />}
      </form.AppField>
      <form.AppField name="category">
        {(field) => <field.SelectField label="Catégorie *" options={categoryOptions} />}
      </form.AppField>
      <form.AppField name="level">
        {(field) => <field.SelectField label="Niveau *" options={levelOptions} placeholder="Choisir un niveau" />}
      </form.AppField>
      <DialogFooter>
        <form.AppForm>
          <form.SubmitButton>Créer</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}

function EditClubForm({ club, onDone }: { club: ClubInput; onDone: () => void }) {
  const update = useActionMutation(updateClub, {
    invalidate: [queryKeys.me.all, queryKeys.home, queryKeys.teams.all, queryKeys.club.all, queryKeys.chat.all],
    onSuccess: onDone,
  });

  const form = useAppForm({
    defaultValues: club,
    validators: { onSubmit: clubSchema },
    onSubmit: async ({ value }) => {
      await update.mutateAsync(clubSchema.parse(value)).catch(() => undefined);
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
          <form.SubmitButton>Enregistrer</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}
