import ky from "ky";

export interface ClubStats {
  equipe: {
    id: string;
    nom: string;
    logo: string | null;
  };
  stats: {
    points: number;
    matchsJoues: number;
    victoires: number;
    nuls: number;
    defaites: number;
    butsMarques: number;
    butsEncaisses: number;
    differenceDeButsGlobale: number;
    formeRecente: string[];
  };
}

export interface ClubStatsResponse {
  classement: ClubStats[];
  totalEquipes: number;
}

export const ClubService = {
  getClubStats: async (): Promise<ClubStats[]> => {
    const response = await ky
      .get("api/statistiques/equipes")
      .json<ClubStatsResponse>();
    return response.classement;
  },
};
