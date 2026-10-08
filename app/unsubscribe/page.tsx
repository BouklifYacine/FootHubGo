import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BellOff, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unsubscribeWithToken } from "@/features/notifications/server/preferences";
import { readUnsubscribeToken } from "@/features/notifications/unsubscribe";
import { appSecret } from "@/lib/signed-token";

export const metadata: Metadata = { title: "Désabonnement - FootHubGo", robots: { index: false } };

/** The confirmation button: a POST, so mail scanners and link previews that open the link change nothing. */
async function confirmUnsubscribe(formData: FormData) {
  "use server";
  const { ok } = await unsubscribeWithToken(String(formData.get("token") ?? ""));
  redirect(ok ? "/unsubscribe?done=1" : "/unsubscribe");
}

/** Opened from the link of a reminder email: one confirmation click, no sign-in, the reminder emails stop. */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; done?: string }>;
}) {
  const { token, done } = await searchParams;
  const valid = token ? readUnsubscribeToken(token, appSecret()) !== null : false;

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      {done ? (
        <>
          <BellOff className="size-10 text-muted-foreground" aria-hidden />
          <h1 className="text-2xl font-bold">Tu es désabonné</h1>
          <p className="text-muted-foreground">
            Tu ne recevras plus les rappels d&apos;événements par email. Les notifications dans l&apos;application
            continuent. Tu peux les réactiver à tout moment dans tes paramètres.
          </p>
        </>
      ) : valid ? (
        <>
          <BellOff className="size-10 text-muted-foreground" aria-hidden />
          <h1 className="text-2xl font-bold">Ne plus recevoir les rappels ?</h1>
          <p className="text-muted-foreground">
            Les rappels d&apos;événements ne te seront plus envoyés par email. Les notifications dans
            l&apos;application continuent.
          </p>
          <form action={confirmUnsubscribe}>
            <input type="hidden" name="token" value={token} />
            <Button type="submit">Me désabonner</Button>
          </form>
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
