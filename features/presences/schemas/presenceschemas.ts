import { StatutPresence } from "@prisma/client";
import z from "zod";

export const CreationPresenceSchema = z.object({

  statut: z.nativeEnum(StatutPresence, {
    required_error: "Le statut de présence est requis.",
  }),
});