import { z } from "zod";

export const CreationEquipeSchema = z.object({
  nom: z
    .string({ message: "Vous devez mettre un nom d'équipe" })
    .min(3, { message: "Le nom doit contenir au moins 3 caractères" })
    .max(35, { message: "Le nom ne peut pas dépasser 35 caractères" })
    .trim(),
    
  description: z
    .union([
      z.string().trim().min(10, { message: "La description doit contenir au moins 10 caractères" })
        .max(100, { message: "La description ne peut pas dépasser 100 caractères" }), 
      z.string().trim().length(0)
    ])
    .optional(),
    
  logoUrl: z
    .union([
      z.string().trim().url({ message: "L'URL du logo doit être une URL valide" }), 
      z.string().trim().length(0)
    ])
    .optional(),
});


export const ChangementDonneeJoueur = z.object({
  role: z.enum(["ENTRAINEUR", "JOUEUR"]),
  posteJoueur: z
    .enum(["GARDIEN", "DEFENSEUR", "MILIEU", "ATTAQUANT"])
    .optional()
});

export const RejoindreEquipeSchema = z.object({
  codeInvitation: z.string()
    .min(1, "Le code d'invitation est requis")
    .max(6, "Le code d'invitation fait maximum 6 caractères")
    .regex(/^\d+$/, "Le code d'invitation doit contenir uniquement des chiffres")
});

export type RejoindreEquipeInput = z.infer<typeof RejoindreEquipeSchema>;