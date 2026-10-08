"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const subscribeNoop = () => () => {};

/** `https://<site>/join/CODE`: opens the invite (sign-up / sign-in with the code already filled). */
export function useInviteLink(code: string | null) {
  const origin = useSyncExternalStore(subscribeNoop, () => window.location.origin, () => process.env.NEXT_PUBLIC_URL ?? "");
  return code ? `${origin}/join/${code}` : null;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * "Partager le lien" (the phone's share sheet: WhatsApp, SMS...) with a copy fallback, and
 * "Copier". Players who open the link join the section in one tap.
 */
export function InviteShareButtons({
  code,
  teamLabel,
  className,
  primaryTour,
}: {
  code: string;
  /** "FC Démo · Seniors A", in the shared message. */
  teamLabel: string;
  className?: string;
  /** `data-tour` of the share button (onboarding). */
  primaryTour?: string;
}) {
  const link = useInviteLink(code);
  const [copied, setCopied] = useState(false);
  if (!link) return null;

  const copy = async () => {
    if (await copyText(link)) {
      setCopied(true);
      toast.success("Lien copié : colle-le dans le groupe de l'équipe");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Copie impossible : sélectionne le lien à la main");
    }
  };

  const share = async () => {
    const text = `Rejoins ${teamLabel} sur FootHubGo : matchs, convocations et messages de l'équipe.`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `Rejoins ${teamLabel}`, text, url: link });
        return;
      } catch (error) {
        if ((error as Error).name === "AbortError") return; // the user closed the share sheet
      }
    }
    await copy();
  };

  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row", className)}>
      <Button onClick={share} className="sm:flex-1" data-tour={primaryTour}>
        <Share2 /> Partager le lien
      </Button>
      <Button variant="outline" onClick={copy} className="sm:flex-1">
        {copied ? <Check /> : <Copy />} {copied ? "Copié" : "Copier le lien"}
      </Button>
    </div>
  );
}
