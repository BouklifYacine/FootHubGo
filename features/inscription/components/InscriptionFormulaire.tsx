"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BoutonConnexionProviders from "@/components/Boutons/BoutonConnexionProviders";
import { z } from "zod";
import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inscriptionAction } from "@/features/inscription/actions/InscriptionAction";
import { BoutonDisabled } from "@/components/Boutons/BoutonDisabled";
import Link from "next/link";
import SchemaInscription from "@/features/inscription/schemas/SchemaInscription";
import { InputPassword } from "../../parametres/components/InputPassword";
import { Lock } from "lucide-react";

type Schema = z.infer<typeof SchemaInscription>;

export default function InscriptionFormulaire({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [erreurMessage, setErreurMessage] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    } as Schema,
    validationLogic: revalidateLogic(),
    validators: { onDynamic: SchemaInscription },
    onSubmit: async ({ value }) => {
      await onSubmit(SchemaInscription.parse(value));
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  const onSubmit = async (data: Schema) => {
    try {
      const result = await inscriptionAction(data);

      if (result.success) {
        router.push("/connexion");
        form.reset();
        setErreurMessage("");
      } else {
        const messageErreur = String(
          result?.error || "Une erreur inconnue est survenue"
        );
        setErreurMessage(messageErreur);
      }
    } catch (error) {
      setErreurMessage("Une erreur est survenue");
      console.error(error)
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>
            Inscrivez-vous avec Google, Github ou votre email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Boutons providers EN DEHORS du form */}
          <div className="flex flex-col gap-4">
            <BoutonConnexionProviders />
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t my-6">
            <span className="bg-card text-muted-foreground relative z-10 px-2">
              Ou continuer avec
            </span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid gap-6">
              {/* Nom */}
              <form.Field name="name">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor="name">Pseudo</Label>
                    <Input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      id="name"
                      type="text"
                      placeholder="Votre nom"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
              {/* Email */}
              <form.Field name="email">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
              {/* Mot de passe */}
              <form.Field name="password">
                {(field) => (
                  <div className="grid gap-3">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <InputPassword
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        id="password"
                        placeholder="Mot de passe"
                        className="pl-10"
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-red-500 text-sm">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
              {/* Erreur */}
              {erreurMessage && (
                <span className="text-red-500 md:text-sm block text-center">
                  {erreurMessage}
                </span>
              )}
              {/* Bouton */}
              {isSubmitting ? (
                <BoutonDisabled
                  texte="Inscription en cours..."
                  classnameButton="w-full"
                  classnameLoader="mr-2 h-4 w-4"
                />
              ) : (
                <Button type="submit" className="w-full cursor-pointer">
                  Inscription
                </Button>
              )}
            </div>
            <div className="text-center text-sm mt-4">
              Déjà inscrit ?{" "}
              <Link
                href="/connexion"
                className="underline underline-offset-4"
              >
                Se connecter
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En cliquant sur inscription, vous acceptez nos{" "}
        <a href="#">Conditions d&apos;utilisation</a> et notre{" "}
        <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  );
}
