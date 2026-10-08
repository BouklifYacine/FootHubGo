"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BellRing, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readLocal, writeLocal } from "../client/pwa";
import { usePush } from "../hooks/use-push";

const DISMISSED_KEY = "fhg-push-card-dismissed";
const DISMISS_DAYS = 30;

const dismissListeners = new Set<() => void>();
const dismissStore = {
  subscribe: (listener: () => void) => {
    dismissListeners.add(listener);
    return () => dismissListeners.delete(listener);
  },
  snapshot: () => {
    const at = Number(readLocal(DISMISSED_KEY) ?? 0);
    return at > 0 && Date.now() - at < DISMISS_DAYS * 86_400_000;
  },
  // Hidden on the server render: shown only once the browser said push is possible.
  serverSnapshot: () => true,
};

function dismiss() {
  writeLocal(DISMISSED_KEY, String(Date.now()));
  dismissListeners.forEach((listener) => listener());
}

/**
 * Home card: invites to turn push on, never on its own (the permission is asked on the tap).
 * Only when it can work and is not on yet; "Plus tard" hides it on this device for 30 days.
 * On an iPhone in Safari: explains that the app must be added to the home screen first.
 */
export function PushOptInCard() {
  const push = usePush();
  const dismissed = useSyncExternalStore(dismissStore.subscribe, dismissStore.snapshot, dismissStore.serverSnapshot);
  if (dismissed || (push.state !== "disabled" && push.state !== "ios-needs-install")) return null;
  const ios = push.state === "ios-needs-install";

  return (
    <section
      aria-labelledby="push-card-title"
      data-testid="push-opt-in"
      className="relative flex gap-3 rounded-2xl border border-info/30 bg-info/10 p-4"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
        <BellRing className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-3 pr-6">
        <div className="space-y-1">
          <h2 id="push-card-title" className="font-semibold">
            Active les notifications pour ne rater aucune convocation
          </h2>
          {ios ? (
            <p className="text-sm text-muted-foreground">
              Sur iPhone, ajoute d&apos;abord FootHubGo à ton écran d&apos;accueil : touche{" "}
              <Share className="inline size-4 align-text-bottom" aria-label="Partager" /> Partager puis «&nbsp;Sur l&apos;écran
              d&apos;accueil&nbsp;», et ouvre l&apos;app depuis son icône.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Convocations, rappels, covoiturage et messages arrivent sur ton téléphone, même app fermée.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {ios ? (
            <Button size="sm" variant="outline" asChild>
              <Link href="/app/settings?section=notifications">En savoir plus</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={() => push.enable.mutate()} disabled={push.pending}>
              Activer les notifications
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={dismiss}>
            Plus tard
          </Button>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="absolute top-1 right-1 size-9" aria-label="Fermer" onClick={dismiss}>
        <X className="size-4" />
      </Button>
    </section>
  );
}
