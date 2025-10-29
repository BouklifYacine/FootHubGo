import { $Enums } from "@prisma/client";


export interface getCallUpApiResponse {
    stats : stats
    convocations : CallUp[]
}

interface stats {
    total: number;
    futures: number;
    passees: number;
    confirmes: number;
    refuses: number;
}

interface CallUp {
convocations: {
    id: string;
    statut: $Enums.StatutConvocation;
    dateEnvoi: Date;
    dateReponse: Date | null;
    evenement: {
        id: string;
        equipe: {
            id: string;
            nom: string;
            logoUrl: string | null;
        };
        titre: string;
        lieu: string | null;
        typeEvenement: $Enums.TypeEvenement;
        dateDebut: Date;
        adversaire: string | null;
    };
}
}
