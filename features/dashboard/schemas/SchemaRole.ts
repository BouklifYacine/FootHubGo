import { z } from "zod";

export const ModifierRoleInputSchema = z.object({
    id: z.string().min(1, "L'ID est requis"),
    newRole: z.enum(["Admin", "utilisateur"], {
    }),
  });