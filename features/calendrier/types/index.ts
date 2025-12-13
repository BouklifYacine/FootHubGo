export type CalendarView = "Mois" | "week" | "day" | "agenda";

export interface PresenceInfo {
  userId: string;
  name: string;
  image?: string;
  statut: "ATTENTE" | "PRESENT" | "ABSENT";
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  location?: string;
  typeEvenement?: "ENTRAINEMENT" | "CHAMPIONNAT" | "COUPE";
  adversaire?: string | null;
  hasStats?: boolean;
  presences?: PresenceInfo[];
}

export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange";
