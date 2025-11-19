import * as z from "zod";

export const createInjurySchema = z.object({
  type: z.string({message: "Le type de blessure est requis"}).min(3, "Le type de blessure doit contenir au moins 3 caractères"),
  
  description: z.string({message: "La description est requise"}).min(10, "La description doit contenir au moins 10 caractères"),
  
  endDate: z.coerce.date({message: "La date de fin doit être une date valide"}).refine((date) => date > new Date(), "La date de fin doit être dans le futur")
});

export type CreateInjuryInput = z.infer<typeof createInjurySchema>;
