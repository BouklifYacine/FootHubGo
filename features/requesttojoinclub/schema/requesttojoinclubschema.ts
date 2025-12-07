import { PosteJoueur, NiveauClub } from "@prisma/client";
import * as z from "zod";

export const requesttojoinclubSchema = z.object({
    poste: z.nativeEnum(PosteJoueur, {
        errorMap: () => ({ message: "Veuillez sélectionner un poste valide." }),
    }),

    niveau: z.nativeEnum(NiveauClub, {
        errorMap: () => ({ message: "Veuillez sélectionner un niveau valide." }),
    }),

    motivation: z
        .string()
        .trim()
        .min(15, { message: "Votre message doit contenir au moins 15 caractères." })
        .max(100, { message: "Votre message ne peut pas dépasser 100 caractères." })
});

export type RequestToJoinClubInput = z.infer<typeof requesttojoinclubSchema>;