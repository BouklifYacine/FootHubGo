import z from "zod";

export const RejoindreEquipeSchema = z.object({
  codeInvitation: z.string()
    .min(1, "Le code d'invitation est requis")
    .max(6, "Le code d'invitation fait maximum 6 caractères")
    .regex(/^\d+$/, "Le code d'invitation doit contenir uniquement des chiffres")
});