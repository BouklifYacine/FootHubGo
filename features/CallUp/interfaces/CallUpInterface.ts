import { $Enums } from "@prisma/client";

export interface TeamListInterface {
  equipe: {
    id: string;
    nom: string;
    RolePlayer: $Enums.RoleEquipe;
    membres: Players[];
  };
}

interface Players {
    id: string;
    name: string;
    email: string;
    image: string | null;
    position: $Enums.RoleEquipe;
    isLicensed: boolean;
    isBlessed: boolean;
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
  playerId: string;
}

export interface ErrorResponse {
  message: string;
}


