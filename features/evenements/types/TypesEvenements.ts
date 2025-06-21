import { $Enums } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

export interface Evenements {
  description: string | null;
  id: string;
  dateCreation: Date;
  equipeId: string;
  titre: string;
  lieu: string | null;
  typeEvenement: $Enums.TypeEvenement;
  dateDebut: Date;
  adversaire: string | null;
  locationData: JsonValue | null;
  weatherData: JsonValue | null;
}

export interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface EvenementsAPI{
    evenements : Evenements[]; 
    pagination : Pagination
}

export interface ReponseModifierPresenceAPI {
    success : boolean ,
    message: string,
    presence: {
    statut: $Enums.StatutPresence;
    id: string;
    userId: string;
    dateCreation: Date;
    evenementId: string;}
}