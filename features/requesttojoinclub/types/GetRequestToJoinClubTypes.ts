import { $Enums } from "@prisma/client";

type TeamSummary = {
  id: string;
  nom: string;
  logoUrl: string | null;
  niveau: $Enums.NiveauClub;
};

type RequestBase = {
  id: string;
  createdAt: Date;
  userId: string;
  statut: $Enums.StatutDemande;
  poste: $Enums.PosteJoueur;
  equipeId: string;
  motivation: string;
  niveau: $Enums.NiveauClub;
};

export type RequestToJoinClubApi = (RequestBase & {
  equipe: TeamSummary;
})[];

export type JoinClubPayload = {
  poste: $Enums.PosteJoueur;
  motivation: string;
  niveau: $Enums.NiveauClub;
};

export type JoinClubResponse = {
  message: string;
};
