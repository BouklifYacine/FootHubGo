import { RejoindreEquipeSchema } from "@/features/equipe/schemas/SchemaEquipe";
import { z } from "zod";

export type CodeInvitationType = {
  success: boolean;
  message: string;
  equipe?: string[];
  equipeId?: string;
};

export type RejoindreEquipeInput = z.infer<typeof RejoindreEquipeSchema>;
