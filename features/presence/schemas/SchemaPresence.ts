import { z } from "zod";

export const PresenceSchema = z.object({
  userId: z.string().optional(),
  statut: z
    .enum(["EN_ATTENTE", "PRESENT", "ABSENT", "INCERTAIN"])
    .default("EN_ATTENTE"),
});


export const UpdatePresenceSchema = z.object({
    statut: z.enum(["EN_ATTENTE", "PRESENT", "ABSENT", "INCERTAIN"]),
  });
