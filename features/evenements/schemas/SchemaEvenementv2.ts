import { z } from "zod";

const evenementBaseSchema = z.object({
  titre: z.string().min(1, "Le titre est requis"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format de date invalide. Utilisez YYYY-MM-DD",
  }),
  heure: z.string().regex(/^\d{1,2}:\d{2}$/, "Format d'heure invalide (HH:MM)"),
  description: z.string().optional().or(z.literal('')),
  lieu: z.string().min(1, "Le lieu est requis").max(100, "Le lieu ne peut pas dépasser 100 caractères"),
  typeEvenement: z.enum(["MATCH", "ENTRAINEMENT"], {
    errorMap: () => ({ message: "Le type d'événement doit être 'MATCH' ou 'ENTRAINEMENT'" })
  }).default("ENTRAINEMENT"),
});

export const evenementUniqueSchema = evenementBaseSchema.extend({
  recurrent: z.literal(false).optional(),
});

export const evenementRecurrentSchema = evenementBaseSchema.extend({
  recurrent: z.literal(true),
  jours: z
    .array(z.number().min(0, "Jour invalide").max(6, "Jour invalide"))
    .min(1, "Sélectionnez au moins un jour"),
  dateFin: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Format de date de fin invalide",
  }),
});

export const evenementSchema = z.discriminatedUnion("recurrent", [
  evenementUniqueSchema,
  evenementRecurrentSchema,
]);

export const filtreEvenementsSchema = z.object({
  debut: z.string().optional(),
  fin: z.string().optional(),
  type: z.enum(["MATCH", "ENTRAINEMENT", "TOUS"], {
    errorMap: () => ({ message: "Le type de filtre doit être 'MATCH', 'ENTRAINEMENT' ou 'TOUS'" })
  }).default("TOUS"),
  limit: z.number().min(1, "La limite doit être d'au moins 1").max(50, "La limite ne peut pas dépasser 50").default(5),
  page: z.number().min(1, "Le numéro de page doit être d'au moins 1").default(1)
});

export type EvenementUnique = z.infer<typeof evenementUniqueSchema>;
export type EvenementRecurrent = z.infer<typeof evenementRecurrentSchema>;
export type Evenement = z.infer<typeof evenementSchema>;
export type FiltreEvenements = z.infer<typeof filtreEvenementsSchema>;