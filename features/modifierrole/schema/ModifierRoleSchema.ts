import z from "zod";

export const ModifierRoleSchema = z.object({
  role: z.enum(["ENTRAINEUR", "JOUEUR"]).optional(),
});
