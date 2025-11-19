type teamname = {
    nom : string
}

export type injuryType = {
    type: string;
    description: string | null;
    endDate: Date;
    id: string;
    userId: string;
    equipeId: string;
    startDate: Date;
    isRecurring: boolean;
}

export type CreateInjuryTypeAPI = {
    injuryType : injuryType
    message : string
}