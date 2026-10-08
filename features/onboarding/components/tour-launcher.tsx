"use client";

import "driver.js/dist/driver.css";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { driver } from "driver.js";
import { useIsMobile } from "@/hooks/use-mobile";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useHome } from "@/features/home/hooks/use-home";
import { useProfile } from "@/features/settings/hooks/use-profile";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { markOnboardingSeen } from "../actions";
import { TOUR_KEYS, buildTour, sideFor, type TourRole } from "../tours";

/** The visible element of an anchor (the bottom tab on phones, the sidebar link on desktop). */
function findVisible(anchor: string) {
  const elements = document.querySelectorAll<HTMLElement>(`[data-tour="${anchor}"]`);
  return [...elements].find((element) => element.getClientRects().length > 0) ?? null;
}

/**
 * Starts the onboarding tour of the user's role on the home, once the home is rendered: the first
 * time (per user, stored in the DB so it follows them across devices) or when replayed
 * ("Revoir le tutoriel" opens /app?tour=1). Mounted once by the app shell.
 */
export function TourLauncher() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const replay = searchParams.get("tour") === "1";
  const isMobile = useIsMobile();
  const { data: profile } = useProfile();
  const { data: team } = useMyTeam();
  const onHome = pathname === "/app";
  const { data: home } = useHome({ enabled: onHome });
  const markSeen = useActionMutation(markOnboardingSeen, { toast: false, invalidate: [queryKeys.me.profile] });
  const running = useRef(false);

  const role: TourRole | null = team?.team ? (team.canManage ? "coach" : "player") : null;
  const seen = role !== null && (profile?.onboardingSeen ?? []).includes(TOUR_KEYS[role]);
  const ready = onHome && !!profile && !!role && !!home && (replay || !seen);

  useEffect(() => {
    if (!ready || !role || running.current) return;
    running.current = true;
    // Let the home finish its layout (cards, bottom tabs) before measuring the anchors.
    const timer = window.setTimeout(() => {
      const steps = buildTour(role, { sectionCount: team?.sections.length ?? 1, find: findVisible });
      if (steps.length === 0) {
        running.current = false;
        return;
      }
      const tour = driver({
        steps: steps.map((step) => ({
          element: step.element,
          popover: { title: step.title, description: step.text, side: sideFor(step.anchor, isMobile), align: "center" },
        })),
        showProgress: true,
        progressText: "{{current}} / {{total}}",
        nextBtnText: "Suivant",
        prevBtnText: "Retour",
        doneBtnText: "C'est parti !",
        allowClose: true,
        popoverClass: "fhg-tour",
        stagePadding: 6,
        stageRadius: 12,
        overlayOpacity: 0.6,
        smoothScroll: true,
        onDestroyed: () => {
          running.current = false;
          markSeen.mutate(TOUR_KEYS[role]);
          if (replay) router.replace("/app", { scroll: false });
        },
      });
      tour.drive();
    }, 700);
    return () => {
      window.clearTimeout(timer);
      running.current = false;
    };
    // Starts once per arrival on the home (or per replay); the rest is read when it starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, role]);

  return null;
}
