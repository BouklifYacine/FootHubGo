import { $Enums } from "@prisma/client";

type TeamSummary = {
  id: string;
  nom: string;
  logoUrl: string | null;
  niveau: $Enums.NiveauClub;
};

export type RequestBase = {
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

// Coach-side types
export type UserSummary = {
  id: string;
  name: string;
  image: string | null;
};

export type CoachApplicationView = RequestBase & {
  user: UserSummary;
};

export type CoachApplicationsApi = CoachApplicationView[];

export type ReviewDecision = "ACCEPTEE" | "REFUSEE";
