import * as z from "zod/v4";

const enumsPoste = ["GARDIEN", "DEFENSEUR", "MILIEU", "ATTAQUANT"] as const;

export const AjouterStatsJoueurSchema = z
  .object({
    poste: z.enum(enumsPoste),
    buts: z
      .number("test buts")
      .min(0, "Rentrez le nombre de buts")
      .max(99, "Maximum 99 buts"),
    passesdecisive: z.coerce
      .number("test pd")
      .min(0, "Rentrez le nombre de passes décisives")
      .max(99, "Maximum 99 passes décisives"),
    note: z
      .number("test note")
      .min(0, "Rentrez une note de match")
      .max(10, "Maximum 10 de note"),
    minutesJouees: z
      .number("test minutes")
      .min(0, "Rentrez le temps de minute joué")
      .max(90, "Maximum 90 minutes "),
    titulaire: z.coerce.boolean(),
  })

  export type schemaAjouterStatsJoueurSchema = z.infer<typeof AjouterStatsJoueurSchema>
