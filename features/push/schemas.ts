import { z } from "zod";
import { PUSH_CATEGORIES } from "./categories";

const base64url = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .regex(/^[A-Za-z0-9_-]+=*$/, "Clé invalide");

/** `PushSubscription.toJSON()` from the browser. The push service host is not restricted. */
export const pushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .max(2048)
    .url()
    .refine((url) => url.startsWith("https://"), "Adresse de notification invalide"),
  keys: z.object({ p256dh: base64url(200), auth: base64url(100) }),
});

export const pushEndpointSchema = z.string().max(2048).url();

export const pushCategorySchema = z.object({ category: z.enum(PUSH_CATEGORIES), enabled: z.boolean() });
