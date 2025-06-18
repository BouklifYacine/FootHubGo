import { z } from "zod";

export const CreationEvenementSchema = z
  .object({
    titre: z
      .string()
      .min(3, "Le titre doit faire au moins 3 caractères")
      .max(35, "Le titre ne peut pas dépasser 35 caractères"),
    dateDebut: z.coerce
      .date()
      .refine((d) => !isNaN(d.getTime()), "Date invalide"),
    typeEvenement: z.enum([
      "ENTRAINEMENT",
      "CHAMPIONNAT",
      "COUPE",
    ]),
    lieu: z.string().min(3).optional(),
    adversaire: z.string().min(3).optional(),
  })
  .superRefine((evt, ctx) => {
    // Si le type est un entraînement, l'adversaire est interdit.
    if (evt.typeEvenement === "ENTRAINEMENT") {
      if (evt.adversaire) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le champ adversaire ne doit pas être présent pour un entraînement.",
          path: ["adversaire"], // Associe l'erreur au champ 'adversaire'
        });
      }
    } else { // Sinon, c'est un match (CHAMPIONNAT ou COUPE)
      // L'adversaire est obligatoire pour les matchs.
      if (!evt.adversaire) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le champ adversaire est obligatoire pour un match (CHAMPIONNAT ou COUPE).",
          path: ["adversaire"], // Associe l'erreur au champ 'adversaire'
        });
      }
    }
  });

export type CreateEventInput = z.infer<typeof CreationEvenementSchema>;