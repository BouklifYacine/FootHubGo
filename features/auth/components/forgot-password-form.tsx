"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useAppForm } from "@/lib/form";
import { authErrorMessage } from "../auth-error";
import { forgotPasswordSchema, resetPasswordSchema } from "../schemas";
import { FormError } from "./auth-layout";
import { PasswordField } from "./password-field";

/**
 * Password reset with better-auth's email OTP plugin:
 * 1. email -> a 6-digit code is emailed (same answer whether the account exists or not),
 * 2. code + new password -> password updated and every session revoked.
 */
export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");

  const emailForm = useAppForm({
    defaultValues: { email: "" },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      setError("");
      const { email } = forgotPasswordSchema.parse(value);
      const { error } = await authClient.emailOtp.requestPasswordReset({ email });
      if (error) return setError(authErrorMessage(error));
      setEmail(email);
    },
  });

  const resetForm = useAppForm({
    defaultValues: { otp: "", password: "" },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!email) return;
      setError("");
      const { otp, password } = resetPasswordSchema.parse(value);
      const { error } = await authClient.emailOtp.resetPassword({ email, otp, password });
      if (error) return setError(authErrorMessage(error));
      toast.success("Mot de passe modifié, tu peux te connecter");
      router.push("/sign-in");
    },
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{email ? "Nouveau mot de passe" : "Mot de passe oublié ?"}</CardTitle>
        <CardDescription>
          {email
            ? `Si un compte existe pour ${email}, un code à 6 chiffres vient d'y être envoyé.`
            : "Entre ton email pour recevoir un code de réinitialisation."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {email ? (
          <form
            key="reset"
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              resetForm.handleSubmit();
            }}
          >
            <resetForm.AppField name="otp">
              {(field) => <field.TextField label="Code" placeholder="123456" />}
            </resetForm.AppField>
            <resetForm.AppField name="password">
              {() => <PasswordField label="Nouveau mot de passe" />}
            </resetForm.AppField>
            <FormError message={error} />
            <resetForm.AppForm>
              <resetForm.SubmitButton className="w-full">Valider</resetForm.SubmitButton>
            </resetForm.AppForm>
            <button
              type="button"
              className="text-muted-foreground text-sm underline-offset-4 hover:underline"
              onClick={() => {
                setEmail(null);
                setError("");
              }}
            >
              Renvoyer un code
            </button>
          </form>
        ) : (
          <form
            key="email"
            className="grid gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              emailForm.handleSubmit();
            }}
          >
            <emailForm.AppField name="email">
              {(field) => <field.TextField label="Email" type="email" placeholder="ton@email.com" />}
            </emailForm.AppField>
            <FormError message={error} />
            <emailForm.AppForm>
              <emailForm.SubmitButton className="w-full">Envoyer le code</emailForm.SubmitButton>
            </emailForm.AppForm>
            <Link href="/sign-in" className="text-center text-sm underline underline-offset-4">
              Retour à la connexion
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
