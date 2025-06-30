import * as z from "zod/v4";

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
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 tirs")
      .optional(),
    tirsCadres: z
      .number()
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 tirs")
      .optional(),
    competition: z.enum(enumsCompetition).optional(),
  })
  .check((ctx) => {
    const {
      butsEncaisses,
      butsMarques,
      cleanSheet,
      resultatMatch,
      tirsCadres,
      tirsTotal,
    } = ctx.value;

    if (resultatMatch === "VICTOIRE" && butsEncaisses >= butsMarques) {
      ctx.issues.push({
        code: "custom",
        message: "Résultat incorrect en cas de victoire",
        input: butsEncaisses,
      });
    }

    if (resultatMatch === "NUL" && butsMarques !== butsEncaisses) {
      ctx.issues.push({
        code: "custom",
        message:
          "Si match nul le nombre de buts encaissés et marqués doivent etre égaux",
        input: ctx.value.butsEncaisses,
      });
    }

    if (resultatMatch === "DEFAITE" && butsMarques >= butsEncaisses) {
      ctx.issues.push({
        code: "custom",
        message:
          "Vous ne pouvez pas avoir plus de buts marqués que encaissés en cas de défaites",
        input: butsMarques,
      });
    }

    if (cleanSheet && butsEncaisses > 0) {
      ctx.issues.push({
        code: "custom",
        message:
          "Vous ne pouvez pas avoir de buts encaissés en cas de cleansheet",
        input: cleanSheet,
      });
    }

    if (tirsTotal != null && tirsCadres != null && tirsCadres > tirsTotal) {
      ctx.issues.push({
        code: "custom",
        message: "Vous ne pouvez pas avoir plus de tirs cadrés que de tirs",
        input: tirsTotal,
      });
    }
  });

  export type SchemaModificationStatsEquipe = z.infer<typeof ModifierStatsEquipeSchema>
