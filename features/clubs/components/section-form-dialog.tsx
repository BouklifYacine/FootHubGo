"use client";

import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogFooter as DialogFooter,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from "@/components/app/responsive-dialog";
import { useAppForm } from "@/lib/form";
import { sectionCategoryLabels, teamLevelLabels, toOptions } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import type { SectionCategory, TeamLevel } from "@/generated/prisma/browser";
import { createSection, updateSection } from "../actions";
import { sectionSchema, type SectionInput } from "../schemas";

const levelOptions = toOptions(teamLevelLabels);
const categoryOptions = toOptions(sectionCategoryLabels);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit mode when given. */
  section?: SectionInput & { id: string };
};

/** Create or edit a section of the club (OWNER / ADMIN). */
export function SectionFormDialog({ open, onOpenChange, section }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>{section ? "Modifier la section" : "Nouvelle section"}</DialogTitle>
          <DialogDescription>
            Une section a ses membres, son calendrier, son code d&apos;invitation et son salon de discussion.
          </DialogDescription>
        </DialogHeader>
        <SectionForm section={section} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SectionForm({ section, onDone }: { section?: Props["section"]; onDone: () => void }) {
  const invalidate = [queryKeys.club.all, queryKeys.me.team, queryKeys.home, queryKeys.chat.all, queryKeys.teams.all];
  const create = useActionMutation(createSection, { invalidate, onSuccess: onDone });
  const update = useActionMutation(updateSection, { invalidate, onSuccess: onDone });

  const form = useAppForm({
    defaultValues: {
      name: section?.name ?? "",
      category: (section?.category ?? "SENIOR") as SectionCategory,
      level: section?.level as TeamLevel | undefined,
    },
    validators: { onSubmit: sectionSchema },
    onSubmit: async ({ value }) => {
      const input = sectionSchema.parse(value);
      await (section ? update.mutateAsync({ ...input, teamId: section.id }) : create.mutateAsync(input)).catch(
        () => undefined,
      );
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
        {(field) => <field.TextField label="Nom *" placeholder="Seniors B" />}
      </form.AppField>
      <form.AppField name="category">
        {(field) => <field.SelectField label="Catégorie *" options={categoryOptions} />}
      </form.AppField>
      <form.AppField name="level">
        {(field) => <field.SelectField label="Niveau *" options={levelOptions} placeholder="Choisir un niveau" />}
      </form.AppField>
      <DialogFooter>
        <form.AppForm>
          <form.SubmitButton>{section ? "Enregistrer" : "Créer la section"}</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}
