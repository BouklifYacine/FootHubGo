import { $Enums } from "@prisma/client";

export type PlayerLeaderboard = {
  id: string;  
  userId: string;
  playerName?: string;
  playerImage?: string | null;              
  playerPosition?: string | null;  
  _sum: {
    buts?: number | null;        
    passesdecisive?: number | null;
  };
};


export type RecentMatch = {
   id: string;  
  lieu: string | null;           
  typeEvenement: $Enums.TypeEvenement;
  dateDebut: string;           
  statEquipe: {
    resultatMatch: $Enums.ResultatMatch | string;
    adversaire: string | null;
    butsMarques: number | null;
    butsEncaisses: number | null;
  };
 statsJoueur?: {
  note: number | null;
}[];
};

type UpcomingEvent = {
  id: string;
  typeEvenement: $Enums.TypeEvenement;
  dateDebut: string;            
  lieu: string | null;
  adversaire : string | undefined
};



export interface ApiAccueil {
  role: $Enums.RoleEquipe;
  
  team: {
    name: string;
    level: $Enums.NiveauClub;
    totalMembers: number;
  };
  
  matches: {
    recent: RecentMatch[];
    upcoming: UpcomingEvent[];
  };
  
  leaderboards: {
    topScorers: PlayerLeaderboard[];
    topAssisters: PlayerLeaderboard[];
  };
}
