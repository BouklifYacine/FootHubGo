import { z } from "zod";
import { addDays, isBefore, startOfDay } from "date-fns";

export const MIN_INJURY_DAYS = 3;

/** Used to report AND edit an injury. */
export const injurySchema = z.object({
  type: z
    .string()
    .trim()
    .min(3, "Le type de blessure doit contenir au moins 3 caractères")
    .max(50, "Le type de blessure ne peut pas dépasser 50 caractères"),
  description: z
    .string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(500, "La description ne peut pas dépasser 500 caractères"),
  endDate: z
    .date({ error: "Choisissez une date de retour" })
    .refine(
      (date) => !isBefore(date, addDays(startOfDay(new Date()), MIN_INJURY_DAYS)),
      `Une blessure doit durer au minimum ${MIN_INJURY_DAYS} jours`,
    ),
});

export type InjuryValues = z.input<typeof injurySchema>;
