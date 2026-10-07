import { z } from "zod";

export const sendCallUpSchema = z.object({
  eventId: z.string().min(1),
  playerId: z.string().min(1),
});

export const replyCallUpSchema = z.object({
  callUpId: z.string().min(1),
  status: z.enum(["CONFIRMED", "DECLINED"], { error: "Réponse invalide" }),
});
