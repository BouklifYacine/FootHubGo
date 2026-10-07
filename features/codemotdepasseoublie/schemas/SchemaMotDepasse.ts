import { z } from "zod";

export const ResetPasswordSchema = z.object({
  code: z
    .string({ error: "Vous devez mettre un code" })
    .min(1, { error: "Vous devez mettre un code" })
    .length(6, { error: "Le code doit contenir exactement 6 caractères" }),

  email: z.email({ error: " Vous devez rentrez un email " }),
  newPassword: z
    .string({ error: "Vous devez mettre un mot de passe" })
    .min(1, { error: "Vous devez mettre un mot de passe" })
    .min(6, "Le mot de passe doit faire au minimum 6 caractères")
    .trim()
    .max(35, "Le mot de passe doit faire au maximum 35 caractères"),
});

export const EmailSchema = z.object({
  email: z.email(),
});
