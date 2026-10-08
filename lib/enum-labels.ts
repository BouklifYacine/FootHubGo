import type {
  AttendanceStatus,
  CallUpStatus,
  ClubRole,
  ClubVisibility,
  Competition,
  EventType,
  JoinRequestStatus,
  MatchResult,
  PlayerPosition,
  SectionCategory,
  SubscriptionPeriod,
  TeamLevel,
  TeamRole,
  UserRole,
} from "@/generated/prisma/browser";

/** French UI labels for every Prisma enum. Use `toOptions()` to feed a `SelectField`. */

export const playerPositionLabels: Record<PlayerPosition, string> = {
  GOALKEEPER: "Gardien",
  RIGHT_BACK: "Défenseur latéral droit",
  CENTER_BACK: "Défenseur central",
  LEFT_BACK: "Défenseur latéral gauche",
  DEFENSIVE_MIDFIELDER: "Milieu défensif",
  CENTRAL_MIDFIELDER: "Milieu central",
  ATTACKING_MIDFIELDER: "Milieu offensif",
  BALL_WINNING_MIDFIELDER: "Milieu récupérateur",
  BOX_TO_BOX_MIDFIELDER: "Milieu relayeur",
  STRIKER: "Attaquant de pointe",
  SUPPORT_STRIKER: "Attaquant de soutien",
  LEFT_WINGER: "Ailier gauche",
  RIGHT_WINGER: "Ailier droit",
  SECOND_STRIKER: "Second attaquant",
};

export const teamLevelLabels: Record<TeamLevel, string> = {
  DEPARTEMENTAL_1: "Départemental 1",
  DEPARTEMENTAL_2: "Départemental 2",
  DEPARTEMENTAL_3: "Départemental 3",
  REGIONAL_1: "Régional 1",
  REGIONAL_2: "Régional 2",
  REGIONAL_3: "Régional 3",
  NATIONAL_1: "National 1",
  NATIONAL_2: "National 2",
  NATIONAL_3: "National 3",
  RECREATIONAL: "Loisir",
};

export const teamRoleLabels: Record<TeamRole, string> = {
  NO_CLUB: "Sans club",
  COACH: "Entraîneur",
  PLAYER: "Joueur",
};

export const clubVisibilityLabels: Record<ClubVisibility, string> = {
  PUBLIC: "Public",
  PRIVATE: "Privé",
  INVITATION: "Sur invitation",
};

export const clubRoleLabels: Record<ClubRole, string> = {
  OWNER: "Propriétaire",
  ADMIN: "Administrateur",
  MEMBER: "Membre",
};

export const sectionCategoryLabels: Record<SectionCategory, string> = {
  SENIOR: "Seniors",
  VETERAN: "Vétérans",
  LEISURE: "Loisir",
};

export const eventTypeLabels: Record<EventType, string> = {
  TRAINING: "Entraînement",
  LEAGUE: "Championnat",
  CUP: "Coupe",
};

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
  PENDING: "En attente",
  PRESENT: "Présent",
  ABSENT: "Absent",
};

/** Coach side of a call-up (glossary: Présent / Absent / En attente). The player answers "Je suis dispo" / "Pas dispo". */
export const callUpStatusLabels: Record<CallUpStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Présent",
  DECLINED: "Absent",
  EXPIRED: "Sans réponse",
};

export const matchResultLabels: Record<MatchResult, string> = {
  WIN: "Victoire",
  LOSS: "Défaite",
  DRAW: "Nul",
};

export const competitionLabels: Record<Competition, string> = {
  LEAGUE: "Championnat",
  CUP: "Coupe",
};

export const joinRequestStatusLabels: Record<JoinRequestStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
};

export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  USER: "Utilisateur",
};

export const subscriptionPeriodLabels: Record<SubscriptionPeriod, string> = {
  MONTH: "Mensuel",
  YEAR: "Annuel",
};

export function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}
