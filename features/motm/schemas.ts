import { z } from "zod";

export const motmVoteSchema = z.object({
  eventId: z.string().min(1).max(64),
  nomineeId: z.string().min(1, "Choisis un joueur").max(64),
});
