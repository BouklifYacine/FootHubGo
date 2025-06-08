export type ErreurAction = Error | unknown;

export type PresenceRetour = {
  id: string;
  userId: string;
  evenementId: string;
  statut: StatutPresence;
  dateCreation: Date;
};

export type ResultatAction<T = void> = {
  success: boolean;
  message: string;
  data?: T;
  erreur?: ErreurAction;
  status?: number;
};

export type StatutPresence = "EN_ATTENTE" | "PRESENT" | "ABSENT" | "INCERTAIN";

export interface Presence {
  titre: string;
  typeEvenement: string;
  description: string;
  lieu: string;
  name: string;
  image: string | null;
  statut: StatutPresence;
  dateDebut: string;
  evenementId: string;
  dateCreation: string;
}

export interface PresenceDetaillée extends Presence {
  userId?: string;
  evenementId: string;
  dateCreation: string;
  dateModification: string;
}

export interface PresenceEvenement {
  evenementId: string;
  userId: string;
  statut: StatutPresence;
} 

export interface CreerPresenceParams {
  evenementId: string;
  statut: StatutPresence;
  userId?: string;
}

// Type pour le contexte d'optimistic update
export type PresenceUpdateContext = {
  previousPresences?: Presence[];
  previousEvenementPresences?: Presence[];
  newPresence?: Partial<Presence>;
  updatedPresence?: Presence;
};