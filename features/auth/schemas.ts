import { z } from "zod";

/** Field rules shared by the auth forms and the settings actions. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Vous devez mettre un email")
  .pipe(z.email("Format d'email invalide"));

/** Same bounds as better-auth (auth.ts). Existing shorter passwords still sign in. */
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit faire au minimum 8 caractères")
  .max(128, "Le mot de passe doit faire au maximum 128 caractères");

export const nameSchema = z
  .string()
  .trim()
  .min(6, "Le pseudo doit faire au minimum 6 caractères")
  .max(35, "Le pseudo doit faire au maximum 35 caractères");

export const codeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Le code doit contenir 6 chiffres");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Vous devez mettre un mot de passe"),
});

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({ otp: codeSchema, password: passwordSchema });
