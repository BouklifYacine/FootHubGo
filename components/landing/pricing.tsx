"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

/**
 * Club subscription, billed monthly or yearly (the two Stripe prices: STRIPE_MONTHLY_PRICE_ID /
 * STRIPE_YEARLY_PRICE_ID). Keep these amounts in sync with the prices configured in Stripe.
 */
const PRICES = {
  monthly: { amount: "9,90 €", period: "par mois", note: "Sans engagement, résiliable à tout moment" },
  yearly: { amount: "99 €", period: "par an", note: "Soit 8,25 € par mois : 2 mois offerts" },
};

const included = [
  "Tout l'effectif : joueurs et entraîneurs, sans limite",
  "Calendrier des entraînements et des matchs",
  "Convocations, présences et rappels automatiques la veille",
  "Statistiques des joueurs et de l'équipe",
  "Suivi des blessures (détails visibles du coach uniquement)",
  "Chat d'équipe en temps réel et sondages",
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const price = isYearly ? PRICES.yearly : PRICES.monthly;

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <h2 className="text-4xl font-bold text-pretty lg:text-6xl">Tarifs</h2>
          <p className="max-w-2xl text-muted-foreground lg:text-xl">
            Un abonnement par club, payé par le club. Les joueurs n&apos;ont rien à payer.
          </p>
          <label className="flex items-center gap-3 text-lg">
            Mensuel
            <Switch checked={isYearly} onCheckedChange={setIsYearly} aria-label="Facturation annuelle" />
            Annuel
          </label>

          <Card className="flex w-full max-w-md flex-col justify-between text-left">
            <CardHeader>
              <CardTitle>Abonnement Club</CardTitle>
              <p className="text-sm text-muted-foreground">Pour une équipe de football amateur</p>
              <p className="mt-2">
                <span className="text-4xl font-bold">{price.amount}</span>{" "}
                <span className="text-muted-foreground">{price.period}</span>
              </p>
              <p className="text-sm text-muted-foreground">{price.note}</p>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              <ul className="space-y-4">
                {included.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href="/sign-up">
                  Créer mon club
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          <p className="text-sm text-muted-foreground">Paiement sécurisé par Stripe.</p>
        </div>
      </div>
    </section>
  );
}
