import { StatutPresence } from "@/generated/prisma/browser";
import z from "zod";

export const CreationPresenceSchema = z.object({

  statut: z.enum(StatutPresence, { error: "Le statut de présence est requis." }),
});