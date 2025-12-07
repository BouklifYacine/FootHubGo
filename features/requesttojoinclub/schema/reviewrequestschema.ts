import { StatutDemande } from "@prisma/client";
import * as z from "zod";

export const ReviewRequestSchema = z.object({
  decision: z.enum([StatutDemande.ACCEPTEE, StatutDemande.REFUSEE], {
    errorMap: () => ({ message: "La décision doit être ACCEPTEE ou REFUSEE." }),
  }),
});