import { Evenement, TypeEvenement } from "@prisma/client";

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
};
