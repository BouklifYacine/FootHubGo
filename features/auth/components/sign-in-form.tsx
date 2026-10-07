"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useAppForm } from "@/lib/form";
import { authErrorMessage } from "../auth-error";
import { signInSchema } from "../schemas";
import { FormError, OrSeparator, TermsNotice } from "./auth-layout";
import { PasswordField } from "./password-field";
import { SocialSignInButtons } from "./social-sign-in-buttons";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      setError("");
      const { error } = await authClient.signIn.email(signInSchema.parse(value));
      if (error) return setError(authErrorMessage(error));
      router.push("/app");
      router.refresh();
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Se connecter</CardTitle>
          <CardDescription>Connexion avec un compte Google ou Github</CardDescription>
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
            <form.AppField name="email">
              {(field) => <field.TextField label="Email" type="email" placeholder="footy@example.com" />}
            </form.AppField>
            <div className="grid gap-2">
              <form.AppField name="password">
                {() => (
                  <PasswordField label="Mot de passe" placeholder="Mot de passe" autoComplete="current-password" />
                )}
              </form.AppField>
              <Link href="/forgot-password" className="ml-auto text-sm underline-offset-4 hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <form.AppForm>
              <form.SubmitButton className="w-full">Connexion</form.SubmitButton>
            </form.AppForm>
            <FormError message={error} />
            <p className="text-center text-sm">
              Vous n&apos;avez pas de compte ?{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                Inscrivez-vous
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <TermsNotice action="connexion" />
    </div>
  );
}
