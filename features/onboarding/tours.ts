import type { OnboardingKey } from "./keys";

/**
 * The onboarding tours (driver.js), as data: one per role, at most 6 steps, anchored on
 * `data-tour` attributes. Pure (no DOM): `buildTour` receives a `find` function, so the steps whose
 * element is missing are dropped and the tour never points at nothing.
 */

export type TourRole = "coach" | "player";

export type TourStepDef = {
  /** Value of the `data-tour` attribute. */
  anchor: string;
  title: string;
  text: string;
};

export const TOUR_KEYS: Record<TourRole, OnboardingKey> = { coach: "coach-v1", player: "player-v1" };

/** At most this many steps per tour (an extra step is dropped from the end of the optional ones). */
export const MAX_TOUR_STEPS = 6;

const SECTION_STEP: TourStepDef = {
  anchor: "section-switcher",
  title: "Tes sections",
  text: "Tu es dans plusieurs sections du club : change de section ici, tout l'écran suit.",
};

export const TOURS: Record<TourRole, TourStepDef[]> = {
  coach: [
    {
      anchor: "home-next-event",
      title: "Ton tableau de bord",
      text: "Ici, le prochain match ou entraînement et qui a répondu. Tout ce qui demande ton attention s'affiche juste en dessous.",
    },
    {
      anchor: "invite-players",
      title: "Invite ton équipe",
      text: "Partage le lien d'invitation sur le groupe WhatsApp : tes joueurs rejoignent le club en un clic.",
    },
    {
      anchor: "nav-agenda",
      title: "Matchs et entraînements",
      text: "Crée tes matchs et tes entraînements (même répétés chaque semaine) depuis l'Agenda.",
    },
    {
      anchor: "home-callup-summary",
      title: "Convoque en deux gestes",
      text: "Choisis tes joueurs, ils sont prévenus tout de suite et répondent depuis leur téléphone.",
    },
    {
      anchor: "nav-messages",
      title: "Le vestiaire",
      text: "Le salon de l'équipe et les messages privés, pour tout dire au même endroit.",
    },
    {
      anchor: "nav-more",
      title: "Et le reste",
      text: "Stats, sondages, blessures et réglages sont dans « Plus ». Tu peux revoir ce guide à tout moment.",
    },
  ],
  player: [
    {
      anchor: "home-next-event",
      title: "Ton prochain rendez-vous",
      text: "Le prochain match ou entraînement de ton équipe, avec l'heure et le lieu.",
    },
    {
      anchor: "callup-answer",
      title: "Dispo ou pas ?",
      text: "Quand le coach te convoque, réponds ici en un geste. Tu peux changer d'avis jusqu'à 3h avant le match.",
    },
    {
      anchor: "nav-agenda",
      title: "Tout le calendrier",
      text: "Tous les matchs et entraînements. Indique ta présence aux entraînements depuis l'Agenda.",
    },
    { anchor: "notification-bell", title: "Ne rate rien", text: "Convocations, rappels et sondages arrivent ici." },
    {
      anchor: "nav-messages",
      title: "Le vestiaire",
      text: "Discute avec toute l'équipe ou en privé avec un coéquipier.",
    },
    {
      anchor: "nav-more",
      title: "Ton profil et tes stats",
      text: "Tes stats, tes blessures et ton profil (photo, poste) sont dans « Plus ». Tu peux revoir ce guide à tout moment.",
    },
  ],
};

/** Steps that can go first when space is needed (the first and the last ones always stay). */
const OPTIONAL_ANCHORS = ["nav-messages", "notification-bell", "home-callup-summary"];

/**
 * The steps to show: the section switcher first for members of several sections, only the steps
 * whose element exists (`find`), at most MAX_TOUR_STEPS.
 */
export function buildTour<E>(role: TourRole, { sectionCount, find }: { sectionCount: number; find: (anchor: string) => E | null }) {
  const defs = sectionCount > 1 ? [SECTION_STEP, ...TOURS[role]] : TOURS[role];
  let steps = defs.flatMap((def) => {
    const element = find(def.anchor);
    return element ? [{ ...def, element }] : [];
  });
  for (const anchor of OPTIONAL_ANCHORS) {
    if (steps.length <= MAX_TOUR_STEPS) break;
    steps = steps.filter((step) => step.anchor !== anchor);
  }
  return steps.slice(0, MAX_TOUR_STEPS);
}

/** Bubbles of the bottom tabs open above them (mobile); elsewhere driver.js picks the side. */
export const sideFor = (anchor: string, isMobile: boolean) =>
  isMobile && anchor.startsWith("nav-") ? ("top" as const) : isMobile ? ("bottom" as const) : undefined;
