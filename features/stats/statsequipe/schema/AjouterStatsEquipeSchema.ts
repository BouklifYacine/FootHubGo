import { z } from "zod";

const enumsResultat = ["VICTOIRE", "DEFAITE", "NUL"] as const;
const enumsCompetition = ["CHAMPIONNAT", "COUPE"] as const;

export const AjouterStatsEquipeSchema = z.object({
  resultatMatch: z.enum(enumsResultat),
  cleanSheet: z.coerce.boolean(),
  butsMarques: z
    .number()
    .min(0, "Rentrez le nombre de buts")
    .max(99, "Maximum 99 buts"),
  butsEncaisses: z
    .number()
    .min(0, "Rentrez le nombre de buts")
    .max(99, "Maximum 99 buts"),
  domicile: z.coerce.boolean(),
  tirsTotal: z
    .number()
    .min(0, "Rentrez le nombre de buts")
    .max(99, "Maximum 99 tirs")
    .optional(),
  tirsCadres: z
    .number()
    .min(0, "Rentrez le nombre de buts")
    .max(99, "Maximum 99 tirs")
    .optional(),
  competition: z.enum(enumsCompetition),

});
