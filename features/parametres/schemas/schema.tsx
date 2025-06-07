
import { z } from "zod"

export const schemaVerificationMotDePasse = z.object({
  motdepasse: z.string().min(1, "Le mot de passe est requis")
})

export const schemaEmail = z.object({
  nouvelEmail: z
    .string({ message: "Vous devez mettre un email" })
    .email({ message: "Vous devez mettre un email valide" }),
    codeverification: z
    .string({ message: "Vous devez mettre un code" })
    .length(6, { message: "Le code doit contenir exactement 6 caractères" })
})

export const schemaMotDePasse = z.object({
  motdepasse: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
    .max(35, { message: "Le mot de passe doit avoir au maximum 35 caractères" }),
  codeverification: z
    .string()
    .length(6, { message: "Le code doit contenir exactement 6 caractères" })
})

export const schemaPseudo = z.object({
  pseudo: z
    .string()
    .min(6, { message: "Votre pseudo doit avoir au moins 6 caractères" })
    .max(35, { message: "Votre pseudo doit avoir au maximum 35 caractères" }),
  codeverification: z
    .string()
    .length(6, { message: "Le code doit contenir exactement 6 caractères" })
})

export type TypeVerificationMotDePasse = z.infer<typeof schemaVerificationMotDePasse>
export type TypeEmail = z.infer<typeof schemaEmail>
export type TypeMotDePasse = z.infer<typeof schemaMotDePasse>
export type TypePseudo = z.infer<typeof schemaPseudo>