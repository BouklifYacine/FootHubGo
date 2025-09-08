import { $Enums } from "@prisma/client";

type PlayerLeaderboard = {
  userId: string;
  playerName?: string;           
  _sum: {
    buts?: number | null;        
    passesdecisive?: number | null;
  };
};

type RecentMatch = {
  lieu: string | null;           
  typeEvenement: $Enums.TypeEvenement;
  dateDebut: string;           
  statEquipe: {
    resultatMatch: $Enums.ResultatMatch;
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
