/**
 * Keys stored in `User.onboardingSeen` (one per tour version / dismissed hint). Bump a tour's version
 * (e.g. "coach-v2") to show a reworked tour again to everyone.
 */
export const ONBOARDING_KEYS = ["coach-v1", "player-v1", "coach-checklist"] as const;
export type OnboardingKey = (typeof ONBOARDING_KEYS)[number];
