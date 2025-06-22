import { z } from "zod";

export const ModifierEvenementSchema = z
  .object({
    titre: z
      .string()
      .min(3, "Le titre doit faire au moins 3 caractères")
      .max(35, "Le titre ne peut pas dépasser 35 caractères")
      .optional(),
    dateDebut: z
      .date() 
      .transform((s) => new Date(s))
      .refine((d) => d instanceof Date && !isNaN(d.getTime()), {
        message: "Date invalide",
      })
      .optional(),
    typeEvenement: z.enum(["ENTRAINEMENT", "CHAMPIONNAT", "COUPE"]).optional(),
    lieu: z
      .string()
      .min(3, "Le lieu doit faire au moins 3 caractères")
      .optional(),
    adversaire: z
      .string()
      .min(3, "L'adversaire doit faire au moins 3 caractères")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Au moins un champ doit être fourni pour la mise à jour",
  })
  .superRefine((evt, ctx) => {
    // Si le type est un entraînement, l'adversaire est interdit.
    if (evt.typeEvenement === "ENTRAINEMENT") {
      if (evt.adversaire) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Le champ adversaire ne doit pas être présent pour un entraînement.",
          path: ["adversaire"], // Associe l'erreur au champ 'adversaire'
        });
      }
    } else {
      // Sinon, c'est un match (CHAMPIONNAT ou COUPE)
      // L'adversaire est obligatoire pour les matchs.
      if (!evt.adversaire) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Le champ adversaire est obligatoire pour un match (CHAMPIONNAT ou COUPE).",
          path: ["adversaire"], // Associe l'erreur au champ 'adversaire'
        });
      }
    }
  });

export type ModifierEvenement = z.infer<typeof ModifierEvenementSchema>;
