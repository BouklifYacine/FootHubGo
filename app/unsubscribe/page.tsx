import type { Metadata } from "next";
import Link from "next/link";
import { BellOff, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unsubscribeWithToken } from "@/features/notifications/server/preferences";

export const metadata: Metadata = { title: "Désabonnement - FootHubGo", robots: { index: false } };

/** Opened from the link of a reminder email: one click, no sign-in, the reminder emails stop. */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const { ok } = await unsubscribeWithToken(token);

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      {ok ? (
        <>
          <BellOff className="size-10 text-muted-foreground" aria-hidden />
          <h1 className="text-2xl font-bold">Tu es désabonné</h1>
          <p className="text-muted-foreground">
            Tu ne recevras plus les rappels d&apos;événements par email. Les notifications dans l&apos;application
            continuent. Tu peux les réactiver à tout moment dans tes paramètres.
          </p>
        </>
      ) : (
        <>
          <TriangleAlert className="size-10 text-destructive" aria-hidden />
          <h1 className="text-2xl font-bold">Lien invalide</h1>
          <p className="text-muted-foreground">
            Ce lien de désabonnement n&apos;est pas valide. Tu peux gérer tes emails dans tes paramètres.
          </p>
        </>
      )}
      <Button asChild variant="outline">
        <Link href="/app/settings">Gérer mes notifications</Link>
      </Button>
    </main>
  );
}
