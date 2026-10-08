"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOutAndRedirect } from "@/lib/auth-client";
import { useAppForm } from "@/lib/form";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { PasswordField } from "@/features/auth/components/password-field";
import { confirmEmailChange, requestEmailChange, updateName, updatePassword } from "../actions";
import { confirmEmailChangeSchema, updateEmailSchema, updateNameSchema, updatePasswordSchema } from "../schemas";
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
    <SettingsCard title="Pseudo" description="Le nom que voit ton club">
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

/** Two steps: password + new address, then the code sent to that address. */
export function EmailForm() {
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  return (
    <SettingsCard
      title="Email"
      description={
        pendingEmail
          ? `Saisis le code envoyé à ${pendingEmail}. Tu seras ensuite déconnecté de tous tes appareils.`
          : "Un code de confirmation sera envoyé à la nouvelle adresse"
      }
    >
      {pendingEmail ? (
        <ConfirmEmailForm onCancel={() => setPendingEmail(null)} />
      ) : (
        <RequestEmailForm onSent={setPendingEmail} />
      )}
    </SettingsCard>
  );
}

function RequestEmailForm({ onSent }: { onSent: (email: string) => void }) {
  const mutation = useActionMutation(requestEmailChange, { onSuccess: (data) => onSent(data.email) });
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: updateEmailSchema },
    onSubmit: ({ value }) => mutation.mutateAsync(value).catch(() => undefined),
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="email">
        {(field) => <field.TextField label="Nouvel email" type="email" placeholder="ton@email.com" />}
      </form.AppField>
      <form.AppField name="password">
        {() => <PasswordField label="Mot de passe actuel" autoComplete="current-password" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton className="w-fit">Recevoir un code</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

function ConfirmEmailForm({ onCancel }: { onCancel: () => void }) {
  const mutation = useActionMutation(confirmEmailChange, { onSuccess: () => signOutAndRedirect() });
  const form = useAppForm({
    defaultValues: { code: "" },
    validators: { onSubmit: confirmEmailChangeSchema },
    onSubmit: ({ value }) => mutation.mutateAsync(value).catch(() => undefined),
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField name="code">
        {(field) => (
          <field.TextField label="Code reçu par email" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" />
        )}
      </form.AppField>
      <div className="flex gap-2">
        <form.AppForm>
          <form.SubmitButton className="w-fit">Confirmer le changement</form.SubmitButton>
        </form.AppForm>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
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
      description="Tu seras déconnecté de tous tes appareils après le changement"
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
