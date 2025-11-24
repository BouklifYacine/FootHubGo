// schema/AjouterStatsJoueurSchema.ts
import { z } from "zod";

export const enumsPoste = [
  "GARDIEN",
  "DEFENSEUR_LATERAL_DROIT",
  "DEFENSEUR_CENTRAL",
  "DEFENSEUR_LATERAL_GAUCHE",
  "MILIEU_DEFENSIF",
  "MILIEU_CENTRAL",
  "MILIEU_OFFENSIF",
  "MILIEU_RECUPERATEUR",
  "MILIEU_RELAYEUR",
  "ATTAQUANT_DE_POINTE",
  "ATTAQUANT_DE_SOUTIEN",
  "AILIER_GAUCHE",
  "AILIER_DROIT",
  "SECOND_ATTAQUANT",
] as const;

export const AjouterStatsJoueurSchema = z.object({
  poste: z.enum(enumsPoste),
  buts: z.coerce
    .number()
    .min(0, "Rentrez le nombre de buts")
    .max(99, "Maximum 99 buts"),
  passesdecisive: z.coerce
    .number()
    .min(0, "Rentrez le nombre de passes décisives")
    .max(99, "Maximum 99 passes décisives"),
  minutesJouees: z.coerce
    .number()
    .min(0, "Rentrez le nombre de minutes jouées")
    .max(90, "Maximum 90 minutes"),
  note: z.coerce
    .number()
    .min(0, "Rentrez une note de match")
    .max(10, "Maximum 10 de note"),
  titulaire: z.coerce.boolean(),
});

export type schemaAjouterStatsJoueurSchema = z.infer<
  typeof AjouterStatsJoueurSchema
>;
