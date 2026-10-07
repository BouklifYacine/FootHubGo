import { z } from "zod";
import { PlayerPosition, TeamLevel } from "@/generated/prisma/browser";

/** The application form (create and edit). */
export const joinRequestSchema = z.object({
  position: z.enum(PlayerPosition, { error: "Veuillez sélectionner un poste valide" }),
  level: z.enum(TeamLevel, { error: "Veuillez sélectionner un niveau valide" }),
  motivation: z
    .string()
    .trim()
    .min(15, "Votre message doit contenir au moins 15 caractères")
    .max(100, "Votre message ne peut pas dépasser 100 caractères"),
});

export type JoinRequestInput = z.infer<typeof joinRequestSchema>;

export const sendJoinRequestSchema = joinRequestSchema.extend({ teamId: z.string().min(1) });

export const updateJoinRequestSchema = joinRequestSchema.extend({ requestId: z.string().min(1) });

export const reviewJoinRequestSchema = z.object({
  requestId: z.string().min(1),
  decision: z.enum(["ACCEPTED", "REJECTED"], { error: "Décision invalide" }),
});
