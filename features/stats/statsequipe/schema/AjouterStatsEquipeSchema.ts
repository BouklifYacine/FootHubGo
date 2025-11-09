import * as z from "zod";

const enumsResultat = ["VICTOIRE", "DEFAITE", "NUL"] as const;
const enumsCompetition = ["CHAMPIONNAT", "COUPE"] as const;

export const AjouterStatsEquipeSchema = z
  .object({
    resultatMatch: z.enum(enumsResultat),
    cleanSheet: z.coerce.boolean(),
    butsMarques: z.coerce
      .number()
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 buts"),
    butsEncaisses: z.coerce
      .number()
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 buts"),
    domicile: z.coerce.boolean(),
    
    // ✅ CORRECTION : Transforme les champs vides en undefined
    tirsTotal: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      })
      .refine((val) => val === undefined || (val >= 0 && val <= 99), {
        message: "Entre 0 et 99 tirs",
      }),
    
    tirsCadres: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      })
      .refine((val) => val === undefined || (val >= 0 && val <= 99), {
        message: "Entre 0 et 99 tirs",
      }),
    
    competition: z.enum(enumsCompetition),
  })
  .superRefine((data, ctx) => {
    const {
      butsEncaisses,
      butsMarques,
      cleanSheet,
      resultatMatch,
      tirsCadres,
      tirsTotal,
    } = data;

    if (resultatMatch === "VICTOIRE" && butsEncaisses >= butsMarques) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Résultat incorrect en cas de victoire",
        path: ["butsEncaisses"],
      });
    }

    if (resultatMatch === "NUL" && butsMarques !== butsEncaisses) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Si match nul, les buts doivent être égaux",
        path: ["butsEncaisses"],
      });
    }

    if (resultatMatch === "DEFAITE" && butsMarques >= butsEncaisses) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Stats de buts marqués et encaissé incorrect en cas de défaite",
        path: ["butsMarques"],
      });
    }

    if (cleanSheet && butsEncaisses > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pas de buts encaissés en clean sheet",
        path: ["cleanSheet"],
      });
    }

    if (!cleanSheet && butsEncaisses === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cochez le champ Clean Sheet",
        path: ["cleanSheet"],
      });
    }

    if (tirsTotal !== undefined && butsMarques > tirsTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vous ne pouvez pas avoir plus de buts que de tirs totaux",
        path: ["butsMarques"],
      });
    }

    if (tirsTotal !== undefined && tirsCadres !== undefined && tirsCadres > tirsTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tirs cadrés ne peuvent pas dépasser tirs totaux",
        path: ["tirsCadres"],
      });
    }
  });

export type SchemaAjouterStatsEquipe = z.infer<typeof AjouterStatsEquipeSchema>;
