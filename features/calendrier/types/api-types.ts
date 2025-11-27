import { Evenement, TypeEvenement } from "@prisma/client";

export type CalendarEventResponse = {
  id: string;
  titre: string;
  description?: string;
  location?: string;
  typeEvenement: TypeEvenement;
  dateDebut: Date;
  adversaire?: string;
  weatherData?: string;
  equipeId: string;
};
