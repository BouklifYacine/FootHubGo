"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useAppForm } from "@/lib/form";
import { authErrorMessage } from "../auth-error";
import { signUpSchema } from "../schemas";
import { FormError, OrSeparator, TermsNotice } from "./auth-layout";
import { PasswordField } from "./password-field";
import { SocialSignInButtons } from "./social-sign-in-buttons";

export function SignUpForm() {
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
      toast.success("Compte créé, vous pouvez vous connecter");
      router.push("/sign-in");
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>Inscrivez-vous avec Google, Github ou votre email</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <SocialSignInButtons />
          <OrSeparator />
          <form
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.AppField name="name">
              {(field) => <field.TextField label="Pseudo" placeholder="Votre pseudo" />}
            </form.AppField>
            <form.AppField name="email">
              {(field) => <field.TextField label="Email" type="email" placeholder="votre@email.com" />}
            </form.AppField>
            <form.AppField name="password">
              {() => <PasswordField label="Mot de passe" placeholder="Mot de passe" />}
            </form.AppField>
            <FormError message={error} />
            <form.AppForm>
              <form.SubmitButton className="w-full">Inscription</form.SubmitButton>
            </form.AppForm>
            <p className="text-center text-sm">
              Déjà inscrit ?{" "}
              <Link href="/sign-in" className="underline underline-offset-4">
                Se connecter
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <TermsNotice action="inscription" />
    </div>
  );
}
