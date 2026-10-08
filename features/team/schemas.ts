import { z } from "zod";
import { PlayerPosition } from "@/generated/prisma/browser";
import { isInviteCodeFormat, normalizeInviteCode } from "./invite-code";

/** A section of the caller's club; omitted = the active section. Always checked on the server. */
export const sectionIdSchema = z.object({ teamId: z.string().min(1).optional() });

export const inviteCodeSchema = z.object({
  inviteCode: z
    .string()
    .max(40)
    .transform(normalizeInviteCode)
    .refine(isInviteCodeFormat, "Le code d'invitation contient 12 caractères (ex. ABCD-EFGH-JKMN)"),
});

export const memberRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["COACH", "PLAYER"], { error: "Rôle invalide" }),
});

export const memberPositionSchema = z.object({
  memberId: z.string().min(1),
  position: z.enum(PlayerPosition, { error: "Poste invalide" }),
});
