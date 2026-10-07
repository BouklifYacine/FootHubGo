import { z } from "zod";
import { PlayerPosition, TeamLevel, TeamVisibility } from "@/generated/prisma/browser";

/** Used to create AND edit a team (same rules on both forms). */
export const teamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Le nom du club doit faire au moins 3 caractères")
    .max(30, "Le nom du club ne peut pas dépasser 30 caractères"),
  description: z
    .string()
    .trim()
    .max(300, "La description ne peut pas dépasser 300 caractères")
    .refine((value) => value === "" || value.length >= 10, {
      message: "La description doit faire au moins 10 caractères",
    }),
  level: z.enum(TeamLevel, { error: "Choisissez un niveau" }),
  visibility: z.enum(TeamVisibility, { error: "Choisissez une visibilité" }),
});

export type TeamInput = z.infer<typeof teamSchema>;

export const inviteCodeSchema = z.object({
  inviteCode: z.string().regex(/^\d{6}$/, "Le code d'invitation contient 6 chiffres"),
});

export const memberRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["COACH", "PLAYER"], { error: "Rôle invalide" }),
});

export const memberPositionSchema = z.object({
  memberId: z.string().min(1),
  position: z.enum(PlayerPosition, { error: "Poste invalide" }),
});
