"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useAppForm } from "@/lib/form";
import { authErrorMessage } from "../auth-error";
import { withNext } from "../next-url";
import { signUpSchema } from "../schemas";
import { FormError, OrSeparator, TermsNotice } from "./auth-layout";
import { PasswordField } from "./password-field";
import { SocialSignInButtons } from "./social-sign-in-buttons";

/**
 * Sign-up signs the user in right away (better-auth `autoSignIn`, no email verification for now)
 * and goes on to `next` (an invite link) or the app home.
 */
export function SignUpForm({ next = "/app" }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useAppForm({
    defaultValues: { name: "", email: "", password: "" },
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value }) => {
      setError("");
      // The welcome email is sent by the `user.create.after` hook in `auth.ts`.
      const { error } = await authClient.signUp.email(signUpSchema.parse(value));
      if (error) return setError(authErrorMessage(error));
      toast.success("Bienvenue sur FootHubGo !");
      router.push(next);
      router.refresh();
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>Avec Google, GitHub ou ton email : c&apos;est gratuit.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <SocialSignInButtons mode="sign-up" next={next} />
          <OrSeparator />
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.AppField name="name">
              {(field) => (
                <field.TextField
                  label="Prénom et nom (ou pseudo)"
                  placeholder="Ex. Karim B."
                  autoComplete="name"
                  description="Visible par ton équipe. Il doit être unique sur FootHubGo."
                />
              )}
            </form.AppField>
            <form.AppField name="email">
              {(field) => <field.TextField label="Email" type="email" placeholder="ton@email.com" autoComplete="email" />}
            </form.AppField>
            <form.AppField name="password">
              {() => <PasswordField label="Mot de passe" placeholder="8 caractères minimum" autoComplete="new-password" />}
            </form.AppField>
            <FormError message={error} />
            <form.AppForm>
              <form.SubmitButton className="w-full">Créer mon compte</form.SubmitButton>
            </form.AppForm>
            <p className="text-center text-sm">
              Déjà inscrit ?{" "}
              <Link href={withNext("/sign-in", next)} className="underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <TermsNotice action="Créer mon compte" />
    </div>
  );
}
