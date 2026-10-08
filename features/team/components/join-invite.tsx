"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sectionCategoryLabels } from "@/lib/enum-labels";
import { withNext } from "@/features/auth/next-url";
import type { SectionCategory } from "@/generated/prisma/browser";
import { useJoinWithCode } from "../hooks/use-join-with-code";
import { InitialsAvatar } from "./initials-avatar";
import { InviteCodeInput } from "./invite-code-input";

/** "J'ai un code": the code typed here opens its invite link. */
export function JoinCodeCard() {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Rejoindre une équipe</CardTitle>
        <CardDescription>Entre le code d&apos;invitation donné par ton coach (12 caractères).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InviteCodeInput autoFocus submitLabel="Continuer" onSubmit={(code) => router.push(`/join/${code}`)} />
        <p className="text-center text-sm text-muted-foreground">
          Pas de code ? Demande le lien d&apos;invitation à ton coach, ou{" "}
          <Link href="/sign-up" className="underline underline-offset-4">
            crée ton club
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}

type Target = {
  id: string;
  name: string;
  category: SectionCategory;
  inviteCode: string;
  club: { id: string; name: string; logoUrl: string | null };
};

type Props = {
  code: string;
  signedIn: boolean;
  target: Target | null;
  rateLimited: boolean;
  membership: { clubId: string; clubName: string; sectionIds: string[] } | null;
};

/** The invite link page: who invites you, then sign up / sign in, or one tap to join. */
export function JoinInviteCard({ code, signedIn, target, rateLimited, membership }: Props) {
  const join = useJoinWithCode();

  if (!target) {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <CircleAlert className="size-10 text-destructive" aria-hidden />
          <CardTitle className="text-xl">{rateLimited ? "Trop de tentatives" : "Lien d'invitation invalide"}</CardTitle>
          <CardDescription>
            {rateLimited
              ? "Réessaie dans quelques minutes."
              : "Ce code n'existe pas ou a été changé par le coach. Demande-lui un nouveau lien."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/join">Saisir un code</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={signedIn ? "/app" : "/"}>Retour</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const next = `/join/${target.inviteCode}`;
  const alreadyInSection = membership?.sectionIds.includes(target.id);
  const otherClub = membership && membership.clubId !== target.club.id ? membership.clubName : null;

  return (
    <Card>
      <CardHeader className="items-center gap-3 text-center">
        <InitialsAvatar name={target.club.name} src={target.club.logoUrl} className="size-16 text-lg" />
        <div className="space-y-1">
          <CardDescription>Tu es invité à rejoindre</CardDescription>
          <CardTitle className="text-2xl">{target.club.name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Section {target.name} · {sectionCategoryLabels[target.category]}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!signedIn ? (
          <>
            <Button asChild size="lg">
              <Link href={withNext("/sign-up", next)}>Créer mon compte et rejoindre</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={withNext("/sign-in", next)}>J&apos;ai déjà un compte</Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">Gratuit pour les joueurs. Le code est déjà rempli.</p>
          </>
        ) : alreadyInSection ? (
          <>
            <p className="flex items-center justify-center gap-2 text-center text-sm">
              <PartyPopper className="size-4 text-success" aria-hidden /> Tu fais déjà partie de cette section.
            </p>
            <Button asChild size="lg">
              <Link href="/app">Aller à l&apos;accueil</Link>
            </Button>
          </>
        ) : otherClub ? (
          <>
            <p className="text-center text-sm text-muted-foreground">
              Tu es déjà membre de {otherClub}. Pour rejoindre ce club, quitte d&apos;abord le tien (Équipe).
            </p>
            <Button asChild variant="outline" size="lg">
              <Link href="/app">Retour à l&apos;accueil</Link>
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" disabled={join.isPending} onClick={() => join.mutate({ inviteCode: code })}>
              Rejoindre {target.name}
            </Button>
            <Button asChild variant="ghost">
              <Link href="/app">Plus tard</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
