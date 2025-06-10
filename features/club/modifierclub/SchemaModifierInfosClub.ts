import { z } from "zod";

// On définit les valeurs possibles pour nos enums
const niveauClubValues = ["DEPARTEMENTAL", "REGIONAL", "NATIONAL", "LOISIR"] as const;
// const statutClubValues = ["PUBLIC", "PRIVE", "INVITATION"] as const;

export const SchemaModifierInfosClub = z
  .object({
    nom: z
      .string()
      .min(3, "Le nom du club doit faire au moins 3 caractères.")
      .max(30, "Le nom du club ne peut pas dépasser 30 caractères.")
      .optional(), // Permet de ne pas inclure ce champ dans la requête

    description: z
      .string()
      .min(10, "La description doit faire au moins 10 caractères.")
      .max(300, "La description ne peut pas dépasser 300 caractères.")
      .optional(), // Permet de ne pas inclure ce champ

    niveau: z.enum(niveauClubValues).optional(),

    // statut: z.enum(statutClubValues).optional(),
  })
  