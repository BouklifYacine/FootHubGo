import { z } from "zod";

export const EventSchema = z
  .object({
    titre: z
      .string()
      .min(3, "Le titre doit faire au moins 3 caractères")
      .max(35, "Le titre ne peut pas dépasser 35 caractères"),
    dateDebut: z.coerce
      .date()
      .refine((d) => !isNaN(d.getTime()), "Date invalide"),
    typeEvenement: z.enum(["ENTRAINEMENT", "CHAMPIONNAT", "COUPE"]),
    lieu: z
      .string()
      .min(3, "Le lieu doit faire au moins 3 caractères")
      .optional()
      .or(z.literal("")), // Allow empty string as optional depending on UI
    adversaire: z.string().optional().nullable(),
  })
  .superRefine((evt, ctx) => {
    // Si le type est un entraînement, l'adversaire est interdit/ignoré.
    if (evt.typeEvenement === "ENTRAINEMENT") {
      // On ne fait rien de spécial, l'adversaire sera ignoré côté serveur ou UI
    } else {
      // Sinon, c'est un match (CHAMPIONNAT ou COUPE)
      // L'adversaire est obligatoire pour les matchs.
      if (!evt.adversaire || evt.adversaire.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Le nom de l'adversaire est obligatoire et doit faire au moins 3 caractères pour un match.",
          path: ["adversaire"],
        });
      }
    }
  });

export type EventInput = z.infer<typeof EventSchema>;
