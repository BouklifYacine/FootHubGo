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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({
    resolver: zodResolver(SchemaInscription),
  });

  const router = useRouter();
  const [erreurMessage, setErreurMessage] = useState("");

  const onSubmit = async (data: Schema) => {
    try {
      const result = await inscriptionAction(data);

      if (result.success) {
        router.push("/connexion");
        reset();
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {/* Nom */}
              <div className="grid gap-3">
                <Label htmlFor="name">Pseudo</Label>
                <Input
                  {...register("name")}
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>
              {/* Email */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* Mot de passe */}
              <div className="grid gap-3">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <InputPassword
                    {...register("password")}
                    id="password"
                    placeholder="Mot de passe"
                    className="pl-10"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
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