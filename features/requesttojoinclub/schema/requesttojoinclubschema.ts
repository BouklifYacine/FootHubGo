import { PosteJoueur, NiveauClub } from "@/generated/prisma/browser";
import * as z from "zod";

export const requesttojoinclubSchema = z.object({
    poste: z.enum(PosteJoueur, { error: "Veuillez sélectionner un poste valide." }),

    niveau: z.enum(NiveauClub, { error: "Veuillez sélectionner un niveau valide." }),

    motivation: z
        .string()
        .trim()
        .min(15, { message: "Votre message doit contenir au moins 15 caractères." })
        .max(100, { message: "Votre message ne peut pas dépasser 100 caractères." })
});

export type RequestToJoinClubInput = z.infer<typeof requesttojoinclubSchema>;