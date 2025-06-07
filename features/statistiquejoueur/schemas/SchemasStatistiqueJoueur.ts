import z from "zod";

export const StatistiqueJoueurSchema = z.object({
    userId: z.string().optional(), 
    buts: z.number().int().min(0, "Le nombre de buts ne peut pas être négatif").default(0),
    passes: z.number().int().min(0, "Le nombre de passes décisives ne peut pas être négatif").default(0),
    minutesJouees: z.number().int().min(0, "Le nombre de minutes jouées ne peut pas être négatif").max(120, "Le maximum est de 120 minutes").default(0),
    note: z.number().min(0, "La note minimum est 0").max(10, "La note maximum est 10").default(5),
    titulaire: z.boolean().default(false),
    poste: z.enum(["GARDIEN", "DEFENSEUR", "MILIEU", "ATTAQUANT"], {
      required_error: "Veuillez sélectionner un poste",
      invalid_type_error: "Poste invalide"
    }).default("ATTAQUANT"),
  });