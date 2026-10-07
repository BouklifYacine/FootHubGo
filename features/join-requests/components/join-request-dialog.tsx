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
import { playerPositionLabels, teamLevelLabels, toOptions } from "@/lib/enum-labels";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import type { PlayerPosition, TeamLevel } from "@/generated/prisma/browser";
import { sendJoinRequest, updateJoinRequest } from "../actions";
import { joinRequestSchema, type JoinRequestInput } from "../schemas";

const positionOptions = toOptions(playerPositionLabels);
const levelOptions = toOptions(teamLevelLabels);

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
} & (
  | { mode: "create"; teamId: string }
  | { mode: "edit"; requestId: string; defaultValues: JoinRequestInput }
);

/** One form for sending a join request and editing a pending one. */
export function JoinRequestDialog(props: Props) {
  const { open, onOpenChange } = props;
  const isEdit = props.mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {isEdit ? "Modifier la demande" : "Rejoindre le club"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modifiez votre candidature avant qu'elle ne soit traitée."
              : "Envoyez votre candidature à l'entraîneur."}
          </DialogDescription>
        </DialogHeader>
        <JoinRequestForm {...props} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function JoinRequestForm(props: Props & { onDone: () => void }) {
  const options = { invalidate: [queryKeys.me.joinRequests], onSuccess: props.onDone };
  const send = useActionMutation(sendJoinRequest, options);
  const update = useActionMutation(updateJoinRequest, options);

  const initial = props.mode === "edit" ? props.defaultValues : undefined;
  const form = useAppForm({
    defaultValues: {
      position: initial?.position as PlayerPosition | undefined,
      level: initial?.level as TeamLevel | undefined,
      motivation: initial?.motivation ?? "",
    },
    validators: { onSubmit: joinRequestSchema },
    onSubmit: async ({ value }) => {
      const input = joinRequestSchema.parse(value);
      const pending =
        props.mode === "edit"
          ? update.mutateAsync({ ...input, requestId: props.requestId })
          : send.mutateAsync({ ...input, teamId: props.teamId });
      await pending.catch(() => undefined); // error toast already shown
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <form.AppField name="position">
        {(field) => (
          <field.SelectField label="Poste souhaité *" options={positionOptions} placeholder="Sélectionnez votre poste" />
        )}
      </form.AppField>
      <form.AppField name="level">
        {(field) => (
          <field.SelectField label="Votre niveau estimé *" options={levelOptions} placeholder="Sélectionnez votre niveau" />
        )}
      </form.AppField>
      <form.AppField name="motivation">
        {(field) => (
          <field.TextareaField label="Motivation *" placeholder="Pourquoi voulez-vous rejoindre ce club ?" />
        )}
      </form.AppField>
      <DialogFooter>
        <form.AppForm>
          <form.SubmitButton>
            {props.mode === "edit" ? "Enregistrer les modifications" : "Envoyer la demande"}
          </form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  );
}
