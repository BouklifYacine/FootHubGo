import * as z from "zod";

const enumsResultat = ["VICTOIRE", "DEFAITE", "NUL"] as const;
const enumsCompetition = ["CHAMPIONNAT", "COUPE"] as const;

export const AjouterStatsEquipeSchema = z
  .object({
    resultatMatch: z.enum(enumsResultat),
    cleanSheet: z.coerce.boolean(),
    butsMarques: z.coerce.number()  
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 buts"),
    butsEncaisses: z.coerce.number()  
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 buts"),
    domicile: z.coerce.boolean(),
    tirsTotal: z.coerce.number() 
      .min(0, "Rentrez le nombre de tirs")
      .max(99, "Maximum 99 tirs")
      .optional(),
    tirsCadres: z.coerce.number() 
      .min(0, "Rentrez le nombre de tirs")
      .max(99, "Maximum 99 tirs")
      .optional(),
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
        message: "Si match nul, le nombre de buts encaissés et marqués doivent être égaux",
        path: ["butsEncaisses"],
      });
    }

    if (resultatMatch === "DEFAITE" && butsMarques >= butsEncaisses) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vous ne pouvez pas avoir plus de buts marqués qu'encaissés en cas de défaite",
        path: ["butsMarques"],
      });
    }

    if (cleanSheet && butsEncaisses > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vous ne pouvez pas avoir de buts encaissés en cas de clean sheet",
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

    if (tirsTotal !== undefined && tirsCadres !== undefined && tirsCadres > tirsTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vous ne pouvez pas avoir plus de tirs cadrés que de tirs totaux",
        path: ["tirsCadres"],
      });
    }
  });

export type SchemaAjouterStatsEquipe = z.infer<typeof AjouterStatsEquipeSchema>;