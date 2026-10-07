"use client";

import { signOutAndRedirect } from "@/lib/auth-client";
import { useAppForm } from "@/lib/form";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { PasswordField } from "@/features/auth/components/password-field";
import { updateEmail, updateName, updatePassword } from "../actions";
import { updateEmailSchema, updateNameSchema, updatePasswordSchema } from "../schemas";
import { SettingsCard } from "./settings-card";

/** Social-only accounts (no password) change their name without confirmation. */
export function NameForm({ currentName, hasPassword }: { currentName: string; hasPassword: boolean }) {
  const mutation = useActionMutation(updateName, { invalidate: [queryKeys.me.all] });
  const form = useAppForm({
    defaultValues: { name: currentName, password: "" },
    validators: { onSubmit: updateNameSchema },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
      form.resetField("password");
    },
  });

  return (
    <SettingsCard title="Pseudo" description="Le nom affiché à votre club">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppField name="name">{(field) => <field.TextField label="Nouveau pseudo" />}</form.AppField>
        {hasPassword && (
          <form.AppField name="password">
            {() => <PasswordField label="Mot de passe actuel" autoComplete="current-password" />}
          </form.AppField>
        )}
        <form.AppForm>
          <form.SubmitButton className="w-fit">Modifier le pseudo</form.SubmitButton>
        </form.AppForm>
      </form>
    </SettingsCard>
  );
}

export function EmailForm() {
  const mutation = useActionMutation(updateEmail, { onSuccess: () => signOutAndRedirect() });
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: updateEmailSchema },
    onSubmit: ({ value }) => mutation.mutateAsync(value).catch(() => undefined),
  });

  return (
    <SettingsCard title="Email" description="Vous serez déconnecté de tous vos appareils après le changement">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppField name="email">
          {(field) => <field.TextField label="Nouvel email" type="email" placeholder="votre@email.com" />}
        </form.AppField>
        <form.AppField name="password">
          {() => <PasswordField label="Mot de passe actuel" autoComplete="current-password" />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton className="w-fit">Changer l&apos;email</form.SubmitButton>
        </form.AppForm>
      </form>
    </SettingsCard>
  );
}

export function PasswordForm() {
  const mutation = useActionMutation(updatePassword, { onSuccess: () => signOutAndRedirect() });
  const form = useAppForm({
    defaultValues: { currentPassword: "", newPassword: "" },
    validators: { onSubmit: updatePasswordSchema },
    onSubmit: ({ value }) => mutation.mutateAsync(value).catch(() => undefined),
  });

  return (
    <SettingsCard
      title="Mot de passe"
      description="Vous serez déconnecté de tous vos appareils après le changement"
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppField name="currentPassword">
          {() => <PasswordField label="Mot de passe actuel" autoComplete="current-password" />}
        </form.AppField>
        <form.AppField name="newPassword">
          {() => <PasswordField label="Nouveau mot de passe" />}
        </form.AppField>
        <form.AppForm>
          <form.SubmitButton className="w-fit">Changer le mot de passe</form.SubmitButton>
        </form.AppForm>
      </form>
    </SettingsCard>
  );
}
