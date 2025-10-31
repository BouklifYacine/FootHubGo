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
import { SchemaConnexion } from "../schemas/SchemaConnexion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { connexionAction } from "../actions/ConnexionAction";
import { BoutonDisabled } from "@/components/Boutons/BoutonDisabled";
import Link from "next/link";

type Schema = z.infer<typeof SchemaConnexion>;

export function ConnexionFormulaire({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Schema>({
    resolver: zodResolver(SchemaConnexion),
  });

  const router = useRouter();
  const [erreurIdentifiant, setErreurIdentifiant] = useState("");

  const onSubmit = async (data: Schema) => {
    try {
      const result = await connexionAction(data);
      console.log(data);

      if (result.success) {
        router.push("/dashboardfoothub");
        router.refresh();
      } else {
        setErreurIdentifiant(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      setErreurIdentifiant("Une erreur est survenue lors de la connexion");
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Se connecter </CardTitle>
          <CardDescription>
            Connexion avec un compte Google ou Github
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <BoutonConnexionProviders></BoutonConnexionProviders>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Ou continuer avec
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="footy@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link href={"connexion/motdepasseoublie"}  className="ml-auto text-sm underline-offset-4 hover:underline">
                     Mot de passe oublié?
                    </Link>
                  
                  </div>
                  <Input
                    {...register("password")}
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {isSubmitting ? (
                  <BoutonDisabled
                    texte="Connexion en cours..."
                    classnameButton="w-full"
                    classnameLoader="mr-2 h-4 w-4"
                  ></BoutonDisabled>
                ) : (
                  <Button type="submit" className="w-full cursor-pointer">
                    Connexion
                  </Button>
                )}

                {erreurIdentifiant && (
                  <span className="text-red-500 md:text-sm block text-center">
                    {erreurIdentifiant}
                  </span>
                )}
              </div>
              <div className="text-center text-sm">
                Vous n&apos;avez pas de compte?{" "}
               
                <Link href={"/inscription"} className="underline underline-offset-4">
                  Inscrivez vous
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
     <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En cliquant sur connexion, vous acceptez nos{" "}
        <a href="#">Conditions d&apos;utilisation</a> et notre{" "}
        <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  );
}
