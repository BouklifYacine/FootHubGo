"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

type Abonnement = {
  nom: string;
  prix: string;
  prixMensuel: string | null;
  reduction: string | null;
  description: string;
  tag: string;
  avantages: string[];
  lienStripe: string;
};



interface ClientSidePaymentProps {
  session: string | null;
  abonnements: Abonnement[];
}

const ClientSidePayment = ({
  session,
  abonnements,
}: ClientSidePaymentProps) => {
  const router = useRouter();
  const [abonnementChoisi, setAbonnementChoisi] = useState("Mensuel");

  const gererAchat = (lienStripe: string) => {
    if (!session) {
      router.push("/connexion");
      return;
    }

    if (lienStripe) {
      router.push(lienStripe);
    }
  };

  return (
    <RadioGroup
      value={abonnementChoisi}
      onValueChange={setAbonnementChoisi}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-center w-full"
    >
      {abonnements.map((abonnement) => (
        <Card
          key={abonnement.nom}
          className={`bg-gray-900 border-2 w-full max-w-xl relative ${
            abonnementChoisi === abonnement.nom
              ? "border-purple-500"
              : "border-gray-700"
          }`}
        >
          {abonnement.tag && (
            <div className="absolute -top-3 right-4 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              {abonnement.tag}
            </div>
          )}
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl font-bold text-white">
              {abonnement.nom}
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              {abonnement.description}
            </CardDescription>
            <div className="text-white">
              <div className="text-5xl font-bold">
                {abonnement.prix}
                <span className="text-lg font-normal ml-1">
                  {abonnement.nom !== "Annuel" ? "/mois" : "/an"}
                </span>
              </div>
              {abonnement.prixMensuel && (
                <div className="text-gray-400 mt-2">
                  Soit {abonnement.prixMensuel}/mois
                  {abonnement.reduction && (
                    <span className="ml-2 text-green-500">
                      (-{abonnement.reduction})
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-white">
            <RadioGroupItem
              value={abonnement.nom}
              id={abonnement.nom}
              className="sr-only"
            />
            <div>
              <h4 className="text-lg font-semibold mb-3">Inclus :</h4>
              <ul className="space-y-3">
                {abonnement.avantages.map((avantage, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-purple-500 mr-3 shrink-0" />
                    <span>{avantage}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="pt-6">
            <Button
              variant={abonnementChoisi === abonnement.nom ? "default" : "outline"}
              className="w-full py-6 text-lg"
              onClick={() => {
                setAbonnementChoisi(abonnement.nom);
                gererAchat(abonnement.lienStripe);
              }}
            >
              {!session
                ? "S'abonner"
                : abonnement.lienStripe
                  ? "Choisir " + abonnement.nom
                  : "Commencer gratuitement"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </RadioGroup>
  );
};

export default ClientSidePayment;