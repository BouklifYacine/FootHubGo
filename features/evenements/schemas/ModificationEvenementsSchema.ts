// features/evenements/schemas/ModificationEvenementsSchema.ts

import { z } from "zod";

export const ModifierEvenementSchema = z
  .object({
    // Le titre est optionnel dans le formulaire de modif, mais s'il est présent, il doit être valide.
    titre: z
      .string()
      .min(3, "Le titre doit faire au moins 3 caractères")
      .max(35, "Le titre ne peut pas dépasser 35 caractères")
      .optional(),

    dateDebut: z.coerce
      .date()
      .refine((d) => !isNaN(d.getTime()), "Date invalide"),

    typeEvenement: z.enum(["ENTRAINEMENT", "CHAMPIONNAT", "COUPE"]),

    // On définit les champs comme pouvant être une chaîne, null, ou optionnels.
    // On retire les validations de longueur d'ici.
    lieu: z.string().nullable().optional(),
    adversaire: z.string().nullable().optional(),
  })
  .transform((data) => {
    // Si c'est un entraînement, on supprime automatiquement l'adversaire
    if (data.typeEvenement === "ENTRAINEMENT") {
      return {
        ...data,
        adversaire: null,
      };
    }
    return data;
  })
  .superRefine((data, ctx) => {
    // CAS 1: C'est un match (pas un entraînement)
    if (data.typeEvenement !== "ENTRAINEMENT") {
      // Pour un match, l'adversaire est requis ET doit avoir une longueur minimale.
      if (!data.adversaire) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "L'adversaire est obligatoire pour un match.",
          path: ["adversaire"],
        });
      } else if (data.adversaire.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le nom de l'adversaire doit faire au moins 3 caractères.",
          path: ["adversaire"],
        });
      }
    }
    // Pour un entraînement, l'adversaire est automatiquement mis à null par le transform
  });

export type CreateEventInput = z.infer<typeof ModifierEvenementSchema>;