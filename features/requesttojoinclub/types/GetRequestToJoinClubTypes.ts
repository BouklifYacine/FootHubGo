// GetRequestToJoinClubResponse

import { $Enums } from "@prisma/client";

type Team = {
  id: string;
  niveau: $Enums.NiveauClub;
  nom: string;
  logoUrl: string | null;
};

type Request = {
  id: string;
  createdAt: Date;
  userId: string;
  statut: $Enums.StatutDemande;
  poste: $Enums.PosteJoueur;
  equipeId: string;
  motivation: string;
  niveau: $Enums.NiveauClub;
};

export type RequestToJoinClubApi = {
  Request: Request[];
  Team: Team;
};
