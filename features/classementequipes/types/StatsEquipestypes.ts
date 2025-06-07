export type ResultatMatch = "VICTOIRE" | "DEFAITE" | "MATCH_NUL";

export type ClassementEquipeReponse = {
  classement: {
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
      formeRecente: ResultatMatch[];
    };
  }[];
  totalEquipes: number;
};