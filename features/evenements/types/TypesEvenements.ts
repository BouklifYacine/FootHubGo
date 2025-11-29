import { $Enums, competition, PosteJoueur, ResultatMatch, StatutPresence, TypeEvenement } from "@prisma/client";
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
  statutPresence: $Enums.StatutPresence;
  locationData: JsonValue | null;
  weatherData: JsonValue | null;

  statEquipe: {
    id: string;
    resultatMatch: $Enums.ResultatMatch;
    butsMarques: number;
    butsEncaisses: number;
    cleanSheet: boolean;
    tirsTotal: number | null;
    tirsCadres: number | null;
    domicile: boolean;
    competition: $Enums.competition;
    adversaire: string;
    dateCreation: Date;
    equipeId: string;
    evenementId: string | null;
  } | null;
  hasStats: boolean;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface EvenementsAPI {
  evenements: Evenements[];
  pagination: Pagination;
}

export interface ReponseModifierPresenceAPI {
  success: boolean;
  message: string;
  presence: {
    statut: $Enums.StatutPresence;
    id: string;
    userId: string;
    dateCreation: Date;
    evenementId: string;
  };
}

export interface EvenementComplet {
  id: string;
  titre: string;
  lieu: string | null;
  typeEvenement: TypeEvenement;
  dateDebut: Date;
  adversaire: string | null;
  nomEquipe: string; 
  presences: Presence[];
  statsEquipe: StatistiqueEquipe | null;
  statsJoueurs: StatsJoueur[];
}

export interface Presence {
  idUtilisateur: string;
  nom: string;
  image: string | null;
  poste: PosteJoueur | null;
  statut: StatutPresence;
}

export interface StatsJoueur {
  id: string;
  idUtilisateur: string;
  nom: string;
  image: string | null;
  buts: number;
  passesdecisive: number;
  note: number;
  minutesJouees: number;
  titulaire: boolean;
  poste: PosteJoueur;
}

export interface StatistiqueEquipe {
  id: string;
  resultatMatch: ResultatMatch;
  butsMarques: number;
  butsEncaisses: number;
  cleanSheet: boolean;
  tirsTotal: number | null;
  tirsCadres: number | null;
  domicile: boolean;
  competition: competition;
  adversaire: string;
  dateCreation: Date;
  equipeId: string;
  evenementId: string | null;
}

