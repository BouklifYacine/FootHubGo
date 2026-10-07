import { z } from "zod";
import { codeSchema, emailSchema, nameSchema, passwordSchema } from "@/features/auth/schemas";

/** Current password, asked before every sensitive change (verified server side). */
const currentPasswordSchema = z.string().min(1, "Vous devez mettre votre mot de passe actuel");

/** Social-only accounts have no password: `password` is then empty and ignored. */
export const updateNameSchema = z.object({ name: nameSchema, password: z.string() });

export const updateEmailSchema = z.object({ email: emailSchema, password: currentPasswordSchema });

export const confirmEmailChangeSchema = z.object({ code: codeSchema });

export const updatePasswordSchema = z.object({
  currentPassword: currentPasswordSchema,
  newPassword: passwordSchema,
});

export const notificationPreferencesSchema = z.object({ emailReminders: z.boolean() });

export const deleteAccountSchema = z.object({ password: z.string() });

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
