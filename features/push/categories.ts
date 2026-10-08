import type { NotificationType } from "@/generated/prisma/enums";

/**
 * Push categories, as the user sees them in the settings (each can be turned off). Which
 * notification types push is decided HERE only: `notifyUser` asks `pushCategoryOf(type)`.
 */
export const PUSH_CATEGORIES = ["callUps", "motm", "carpool", "messages", "club"] as const;
export type PushCategory = (typeof PUSH_CATEGORIES)[number];

export const PUSH_CATEGORY_LABELS: Record<PushCategory, { label: string; description: string }> = {
  callUps: { label: "Convocations & rappels", description: "Tes convocations, les réponses de tes joueurs, le rappel la veille." },
  motm: { label: "Homme du match", description: "L'ouverture du vote et le résultat." },
  carpool: { label: "Covoiturage", description: "Places réservées ou libérées, voiture annulée." },
  messages: { label: "Messages", description: "Les nouveaux messages quand l'application est fermée." },
  club: { label: "Club", description: "Demandes d'adhésion, arrivées dans l'équipe, nouveaux sondages." },
};

/**
 * Category of a notification type, or null when it never pushes (left the team, injuries, finances:
 * in-app only). Vote changes (man of the match, polls) create no notification, so they never push.
 * MESSAGE is pushed by the chat directly (`pushChatMessage`), not through notifications.
 */
const CATEGORY_OF: Record<NotificationType, PushCategory | null> = {
  CALL_UP: "callUps",
  EVENT_REMINDER: "callUps",
  MAN_OF_THE_MATCH: "motm",
  CARPOOL: "carpool",
  MESSAGE: "messages",
  JOIN_REQUEST: "club",
  JOINED_TEAM: "club",
  NEW_POLL: "club",
  LEFT_TEAM: null,
  INJURY_REPORTED: null,
  FINANCE_DUE: null,
};

export function pushCategoryOf(type: NotificationType): PushCategory | null {
  return CATEGORY_OF[type];
}

export function isPushCategory(value: string): value is PushCategory {
  return (PUSH_CATEGORIES as readonly string[]).includes(value);
}

/** True when a user with these muted categories wants a push of this category. */
export function wantsPush(category: PushCategory, mutedCategories: readonly string[]) {
  return !mutedCategories.includes(category);
}

/** The new muted list after turning a category on or off (unknown values are dropped). */
export function toggleMutedCategory(muted: readonly string[], category: PushCategory, enabled: boolean): PushCategory[] {
  const current = muted.filter(isPushCategory).filter((value) => value !== category);
  return enabled ? current : [...current, category];
}
