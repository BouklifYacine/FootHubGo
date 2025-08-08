import { z } from "zod";

const enumsResultat = ["VICTOIRE", "DEFAITE", "NUL"] as const;
const enumsCompetition = ["CHAMPIONNAT", "COUPE"] as const;

export const ModifierStatsEquipeSchema = z
  .object({
    resultatMatch: z.enum(enumsResultat).optional(),
    cleanSheet: z.coerce.boolean().optional(),
    butsMarques: z
      .number()
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 buts")
      .optional(),
    butsEncaisses: z
      .number()
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 buts")
      .optional(),
    domicile: z.coerce.boolean(),
    tirsTotal: z
      .number()
      .min(0, "Rentrez le nombre de tirs")
      .max(99, "Maximum 99 tirs")
      .optional(),
    tirsCadres: z
      .number()
      .min(0, "Rentrez le nombre de tirs cadrés")
      .max(99, "Maximum 99 tirs cadrés")
      .optional(),
    competition: z.enum(enumsCompetition).optional(),
  })
  .superRefine((values, ctx) => {
    const {
      butsEncaisses,
      butsMarques,
      cleanSheet,
      resultatMatch,
      tirsCadres,
      tirsTotal,
    } = values;

    // Victoire : buts marqués > buts encaissés
    if (
      resultatMatch === "VICTOIRE" &&
      butsMarques !== undefined &&
      butsEncaisses !== undefined &&
      butsEncaisses >= butsMarques
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Résultat incorrect en cas de victoire",
        path: ["butsEncaisses"],
      });
    }

    // Match nul : buts marqués == buts encaissés
    if (
      resultatMatch === "NUL" &&
      butsMarques !== undefined &&
      butsEncaisses !== undefined &&
      butsMarques !== butsEncaisses
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Si match nul, le nombre de buts encaissés et marqués doivent être égaux",
        path: ["butsEncaisses"],
      });
    }

    // Défaite : buts marqués < buts encaissés
    if (
      resultatMatch === "DEFAITE" &&
      butsMarques !== undefined &&
      butsEncaisses !== undefined &&
      butsMarques >= butsEncaisses
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Vous ne pouvez pas avoir plus de buts marqués que encaissés en cas de défaite",
        path: ["butsMarques"],
      });
    }

    // Clean sheet : aucun but encaissé
    if (
      cleanSheet &&
      butsEncaisses !== undefined &&
      butsEncaisses > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Vous ne pouvez pas avoir de buts encaissés en cas de clean sheet",
        path: ["butsEncaisses"],
      });
    }

    // Tirs cadrés <= tirs totaux
    if (
      tirsTotal != null &&
      tirsCadres != null &&
      tirsCadres > tirsTotal
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Vous ne pouvez pas avoir plus de tirs cadrés que de tirs totaux",
        path: ["tirsCadres"],
      });
    }
  });

export type SchemaModificationStatsEquipe = z.infer<
  typeof ModifierStatsEquipeSchema
>;