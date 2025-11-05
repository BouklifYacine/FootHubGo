import { z } from "zod";

export const niveau = ["DEPARTEMENTAL", "REGIONAL", "NATIONAL","LOISIR"] as const;

export const SchemaCreationClub = z.object({
    nom: z.string({message : "Veuillez mettre un nom de club"}).min(6, "Minimum 6 caractères pour nom de club ").max(30, "Max 30 caractères pour votre nom de club"), 
    description: z.string({message : "Veuillez mettre un nom de club"}).min(10, "Minimum 10 caractères pour nom de club ").max(300, "Max 300 caractères pour votre nom de club").optional().or(z.literal("")), 
    NiveauClub : z.enum(niveau , {message : "Rentrez un niveau "})

})