import { z } from "zod";

export const SchemaChangementPseudo = z.object({
  pseudo: z
    .string({ message: "Vous devez mettre un pseudo" })
    .min(1, { message: "Vous devez mettre un pseudo" })
    .min(6, { message: "Votre pseudo doit avoir au moins 6 caractères" })
    .max(35, { message: "Votre pseudo doit avoir au maximum 35 caractères" }),

  codeverification: z
    .string({ message: "Vous devez mettre un code" })
    .min(1, { message: "Vous devez mettre un code" })
    .length(6, { message: "Le code doit contenir exactement 6 caractères" }),
});

export const SchemaChangementEmail = z.object({
  nouvelEmail: z
    .string({ message: "Vous devez mettre un email" })
    .email({ message: "Vous devez mettre un email valide" }),

    codeVerification: z
    .string({ message: "Vous devez mettre un code" })
    .min(1, { message: "Vous devez mettre un code" })
    .length(6, { message: "Le code doit contenir exactement 6 caractères" }),
});

export const SchemaChangementMotDePasse = z.object({
  motdepasse: z
    .string({ message: "Vous devez mettre un pseudo" })
    .min(1, { message: "Vous devez mettre un pseudo" })
    .min(6, { message: "Votre pseudo doit avoir au moins 6 caractères" })
    .max(35, { message: "Votre pseudo doit avoir au maximum 35 caractères" }),

  codeverification: z
    .string({ message: "Vous devez mettre un code" })
    .min(1, { message: "Vous devez mettre un code" })
    .length(6, { message: "Le code doit contenir exactement 6 caractères" }),
});


