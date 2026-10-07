import { z } from "zod";

export const sendCallUpsSchema = z.object({
  eventId: z.string().min(1),
  playerIds: z.array(z.string().min(1)).min(1, "Sélectionnez au moins un joueur").max(60),
});

export const replyCallUpSchema = z.object({
  callUpId: z.string().min(1),
  status: z.enum(["CONFIRMED", "DECLINED"], { error: "Réponse invalide" }),
});
