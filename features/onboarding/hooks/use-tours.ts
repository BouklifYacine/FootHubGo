"use client";

import { useRouter } from "next/navigation";

/** Replays the onboarding tour of the user's role (opens the home first, where the tour starts). */
export function useReplayTour() {
  const router = useRouter();
  return () => router.push("/app?tour=1");
}
