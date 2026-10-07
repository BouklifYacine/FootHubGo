import { StatutDemande } from "@/generated/prisma/browser";
import * as z from "zod";

export const ReviewRequestSchema = z.object({
  decision: z.enum([StatutDemande.ACCEPTEE, StatutDemande.REFUSEE], { error: "La décision doit être ACCEPTEE ou REFUSEE." }),
});