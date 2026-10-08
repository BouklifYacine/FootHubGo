"use client";

import { CheckCircle2, Download, Share, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { promptInstall } from "../client/pwa";
import { useInstallMode } from "../hooks/use-push";

/**
 * "Installer l'application": the browser's prompt on Android / Chrome / Edge, the Share → "Sur
 * l'écran d'accueil" steps on iPhone, the browser menu elsewhere. Nothing once installed.
 */
export function InstallAppCard({ showInstalled = false }: { showInstalled?: boolean }) {
  const mode = useInstallMode();
  if (!mode || (mode === "installed" && !showInstalled)) return null;

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4" data-testid="install-app">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
          {mode === "installed" ? <CheckCircle2 className="size-5" aria-hidden /> : <Download className="size-5" aria-hidden />}
        </span>
        <div className="min-w-0 space-y-1">
          <p className="font-semibold">{mode === "installed" ? "Application installée" : "Installe l'application"}</p>
          <p className="text-sm text-muted-foreground">
            {mode === "installed"
              ? "FootHubGo s'ouvre depuis son icône, comme une app."
              : "FootHubGo sur ton écran d'accueil : ouverture en un geste, plein écran, et les notifications sur iPhone."}
          </p>
        </div>
      </div>
      {mode === "prompt" && (
        <Button className="w-full sm:w-auto" onClick={() => void promptInstall()}>
          <Download /> Installer l&apos;application
        </Button>
      )}
      {mode === "ios" && (
        <ol className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Share className="size-4 shrink-0 text-info" aria-hidden />
            <span>
              Dans Safari, touche <strong>Partager</strong> (en bas de l&apos;écran).
            </span>
          </li>
          <li className="flex items-center gap-2">
            <SquarePlus className="size-4 shrink-0 text-info" aria-hidden />
            <span>
              Choisis <strong>Sur l&apos;écran d&apos;accueil</strong>, puis <strong>Ajouter</strong>.
            </span>
          </li>
        </ol>
      )}
      {mode === "manual" && (
        <p className="text-sm text-muted-foreground">
          Depuis le menu de ton navigateur : « Installer l&apos;application » ou « Ajouter à l&apos;écran d&apos;accueil ».
        </p>
      )}
    </div>
  );
}
