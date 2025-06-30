import * as z from "zod/v4";

const enumsPoste = ["GARDIEN", "DEFENSEUR", "MILIEU", "ATTAQUANT"] as const;

export const ModifierStatsJoueurSchema = z
  .object({
    poste: z.enum(enumsPoste).optional(),
    buts: z
      .number("test buts")
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 buts").optional(),
    passesdecisive: z.coerce
      .number("test pd")
      .min(0, "Rentrez le nombre de passes décisives")
      .max(99, "Maximum 99 passes décisives").optional(),
    note: z
      .number("test note")
      .min(0, "Rentrez une note de match")
      .max(10, "Maximum 10 de note").optional(),
    minutesJouees: z
      .number("test minutes")
      .min(0, "Rentrez le temps de minute joué")
      .max(90, "Maximum 90 minutes ").optional(),
    titulaire: z.coerce.boolean(),
  })


  export type TypeModifierStatsJoueurSchema = z.infer<typeof ModifierStatsJoueurSchema>