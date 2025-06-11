// src/features/club/modifierposterole/schemas/schemamodifierposterole.ts
import z from "zod";

export const SchemaModifierPosteRole = z.object({
  role: z.enum(["ENTRAINEUR", "JOUEUR"]).optional(),
  poste: z.enum(["GARDIEN", "DEFENSEUR", "MILIEU", "ATTAQUANT"]).optional(),
});

// J'ai renommé `posteJoueur` en `poste` pour correspondre
// exactement au nom du champ dans ton modèle Prisma `MembreEquipe`.
// C'est une bonne pratique pour éviter les confusions.