import { StatistiqueEquipe } from "@/features/statistiquesequipe/types/statistiquesequipetypes";

export interface Presence {
  id: string;
  statut: "EN_ATTENTE" | "PRESENT" | "ABSENT" | "INCERTAIN";
}

export interface StatistiqueJoueur {
  id: string;
  buts: number;
  passesdécisive: number;
  minutesJouees: number;
  note: number;
  titulaire: boolean;
  poste: string;
}

export interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// Types pour la liste des événements
export interface EvenementListeSuccessResponse {
  success: true;
  evenementsAVenir: Evenement[];
  evenementsPassés: Evenement[];
  pagination: Pagination;
}

export interface EvenementListeErrorResponse {
  success: false;
  message: string;
}

export type EvenementListeResponse =
  | EvenementListeSuccessResponse
  | EvenementListeErrorResponse;

export interface EvenementDetail {
  id: string;
  titre: string;
  description: string | null;
  lieu: string | null;
  typeEvenement: "MATCH" | "ENTRAINEMENT";
  dateDebut: Date;
  dateDebutFormatee: string;
  dateCreation: Date;
  equipeId: string;
}

export interface ConflitDetail {
  date: string;
  dateFormatee: string;
}

export interface JourDetail {
  jour: number;
  nom: string;
}

export interface PeriodeDetail {
  debut: string;
  fin: string;
  jours: JourDetail[];
  heure: string;
}

export interface EvenementCreationSuccessResponse {
  success: true;
  message: string;
  evenement?: EvenementDetail;
  nombreEvenements?: number;
  details?: PeriodeDetail;
  conflits?: ConflitDetail[];
}

export interface EvenementCreationErrorResponse {
  success: false;
  message: string;
  details?: Record<string, unknown>;
  conflits?: ConflitDetail[];
}

export type EvenementCreationResponse =
  | EvenementCreationSuccessResponse
  | EvenementCreationErrorResponse;

export interface Presence {
  id: string;
  statut: "EN_ATTENTE" | "PRESENT" | "ABSENT" | "INCERTAIN";
}

export interface Evenement {
  id: string;
  titre: string;
  description: string | null;
  lieu: string | null;
  typeEvenement: "MATCH" | "ENTRAINEMENT";
  dateDebut: Date;
  dateDebutFormatee: string;
  date: string;
  heure: string;
  dateCreation: Date;
  equipeId: string;
  maPresence: Presence | null;
  presences?: Presence[];
  mesStatistiques?: StatistiqueJoueur | null;
  statistiquesEquipe?: StatistiqueEquipe | null;
}

export interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// Types pour la liste des événements
export interface EvenementListeSuccessResponse {
  success: true;
  evenementsAVenir: Evenement[];
  evenementsPassés: Evenement[];
  pagination: Pagination;
}

export interface EvenementListeErrorResponse {
  success: false;
  message: string;
}

export interface EvenementDetail {
  id: string;
  titre: string;
  description: string | null;
  lieu: string | null;
  typeEvenement: "MATCH" | "ENTRAINEMENT";
  dateDebut: Date;
  dateDebutFormatee: string;
  dateCreation: Date;
  equipeId: string;
}

export interface ConflitDetail {
  date: string;
  dateFormatee: string;
}

export interface JourDetail {
  jour: number;
  nom: string;
}

export interface PeriodeDetail {
  debut: string;
  fin: string;
  jours: JourDetail[];
  heure: string;
}

export interface EvenementCreationSuccessResponse {
  success: true;
  message: string;
  evenement?: EvenementDetail;
  nombreEvenements?: number;
  details?: PeriodeDetail;
  conflits?: ConflitDetail[];
}

export interface EvenementCreationErrorResponse {
  success: false;
  message: string;
  details?: Record<string, unknown>;
  conflits?: ConflitDetail[];
}
