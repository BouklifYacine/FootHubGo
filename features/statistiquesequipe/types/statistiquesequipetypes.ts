import { z } from "zod";
import { StatistiqueEquipeSchema } from "../schemas/SchemaStatistique";

// Types pour les statistiques d'équipe
export type ResultatMatch = "VICTOIRE" | "DEFAITE" | "MATCH_NUL";
export type Competition = "CHAMPIONNAT" | "COUPE";

export interface StatistiqueEquipe {
  id: string;
  evenementId: string;
  equipeId: string;
  resultatMatch: ResultatMatch;
  butsMarques: number;
  butsEncaisses: number;
  cleanSheet: boolean;
  tirsTotal?: number | null;
  tirsCadres?: number | null;
  domicile: boolean;
  competition: Competition;
  adversaire: string;
  createdAt: Date;
  updatedAt: Date;
}

// Type pour les statistiques agrégées que l'API renvoie réellement
export interface StatistiqueEquipeAgrege {
  points: number;
  totalMatchs: number;
  victoires: number;
  nuls: number;
  defaites: number;
  butsMarques: number;
  butsEncaisses: number;
  differenceDeButsGlobale: number;
  cleanSheets: number;
  tauxVictoire: number;
  moyenneButsMarques: number;
  moyenneButsEncaisses: number;
}

export interface StatistiqueEquipeReponse {
  StatistiqueEquipe: StatistiqueEquipeAgrege;
}

export interface ServerActionResponse {
  success: boolean;
  message: string;
  statistiques?: {
    id: string;
    resultatMatch: ResultatMatch;
    butsMarques: number;
    butsEncaisses: number;
    cleanSheet: boolean;
    tirsTotal?: number | null;
    tirsCadres?: number | null;
    domicile: boolean;
    competition: Competition;
    adversaire: string;
  };
  erreurs?: unknown;
}

export type StatistiqueEquipeInputs = z.infer<typeof StatistiqueEquipeSchema>;