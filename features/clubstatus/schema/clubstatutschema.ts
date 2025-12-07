import * as z from "zod";

export const SchemaClubStatus = z.object({
    StatutClub : z.enum(["PUBLIC", "PRIVE", "INVITATION"] , {
        errorMap : () => ({
            message : "Vous devez choisir entre une des options (Public , Prive , Invitation)"
        })
    })
})

export type ReponseStatutClubInput = z.infer<typeof SchemaClubStatus>