import z from "zod";

export const SchemaModifierPoste = z.object({
  poste: z
    .enum([
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
    ])
    .optional(),
});
