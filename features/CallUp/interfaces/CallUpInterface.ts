import { $Enums } from "@prisma/client";

export interface TeamListInterfaceAPI {
  RolePlayer: $Enums.RoleEquipe;
  equipe: {
    id: string;
    nom: string;
    membres: TeamMembersCallUp[];
  };
}

interface TeamMembersCallUp {
    id: string;
    name: string;
    email: string;
    image: string | null;
    position: $Enums.RoleEquipe;
    poste: $Enums.PosteJoueur | null
    isLicensed: boolean;
    isBlessed: boolean;
    convocations: ConvocationInfo[];
}

export interface ConvocationInfo {
  id: string;
  statut: $Enums.StatutConvocation;
  dateEnvoi: Date;
  dateReponse: Date | null;
  evenementId: string;
}

export interface Convocation {
  id: string;
  userId: string;
  evenementId: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
  dateEnvoi: Date;
}

export interface CallUpResponse {
  message: string;
}

export interface CallUpPlayerParams {
  eventId: string;  
  teamId: string;    
  playerId: string;
   
}


export interface ErrorResponse {
  message: string;
}


