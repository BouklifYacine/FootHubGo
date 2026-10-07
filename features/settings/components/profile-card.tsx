"use client";

import { Calendar, Clock, CreditCard, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { subscriptionPeriodLabels } from "@/lib/enum-labels";
import type { Profile } from "../hooks/use-profile";
import { AvatarUpload } from "./avatar-upload";

const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR");

export function ProfileCard({ profile }: { profile: Profile }) {
  const { subscription } = profile;
  const socialProviders = profile.providerIds.filter((id) => id !== "credential");

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-6 py-8 text-center">
        <AvatarUpload image={profile.image} name={profile.name} />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          {socialProviders.map((provider) => (
            <Badge key={provider} variant="outline" className="capitalize">
              Connecté via {provider}
            </Badge>
          ))}
        </div>

        <div className="grid w-full max-w-md gap-3 text-left text-sm">
          <p className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" /> {profile.email}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <Badge>{profile.plan === "pro" ? "Premium" : "Gratuit"}</Badge>
            {profile.clubName && <span className="text-muted-foreground">abonnement du club {profile.clubName}</span>}
            {subscription && <Badge variant="outline">{subscriptionPeriodLabels[subscription.period]}</Badge>}
          </div>
          {subscription && (
            <>
              <p className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" /> Début : {formatDate(subscription.startDate)}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" /> Fin : {formatDate(subscription.endDate)}
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
