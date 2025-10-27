import * as z from "zod";

export const SchemaReponseConvocation = z.object({
  statut: z.enum(["CONFIRME", "REFUSE"], {
    errorMap: () => ({
      message: "Vous ne pouvez choisir que confirme ou refuser pour la convocation",
    }),
  }),
});

export type ReponseConvocationInput = z.infer<typeof SchemaReponseConvocation>;
