import z from "zod";

export const SchemaModifierPoste = z.object({
  poste: z.enum(["GARDIEN", "DEFENSEUR", "MILIEU", "ATTAQUANT"]).optional(),
});
