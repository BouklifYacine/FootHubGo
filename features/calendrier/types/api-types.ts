import { Evenement, TypeEvenement } from "@prisma/client";

export type PresenceInfo = {
  userId: string;
  name: string;
  image?: string;
  statut: "ATTENTE" | "PRESENT" | "ABSENT";
};

export type CalendarEventResponse = {
  id: string;
  titre: string;
  description?: string;
  lieu?: string;
  typeEvenement: TypeEvenement;
  dateDebut: Date;
  adversaire?: string;
  weatherData?: string;
  equipeId: string;
  hasStats?: boolean;
  presences?: PresenceInfo[];
};
