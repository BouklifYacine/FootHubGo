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
