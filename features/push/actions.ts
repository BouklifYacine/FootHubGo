"use server";

import { headers } from "next/headers";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors";
import { enforceRateLimit, rateLimiter } from "@/lib/rate-limit";
import { toggleMutedCategory } from "./categories";
import { pushCategorySchema, pushEndpointSchema, pushSubscriptionSchema } from "./schemas";
import { deviceLabel, subscriptionsToEvict } from "./subscriptions";
import { pushConfig } from "./server/vapid";

const subscribeBudget = rateLimiter("push-subscribe", { max: 20, windowMs: 60 * 60_000 });

/**
 * Registers this browser for push (after the user turned it on and granted the permission).
 * Upsert on the endpoint: a browser shared by two accounts pushes for the last one signed in.
 * At most MAX_SUBSCRIPTIONS_PER_USER devices: the least recently used one is dropped.
 */
export const subscribePush = action(pushSubscriptionSchema, async ({ endpoint, keys }) => {
  const user = await requireUser();
  if (!pushConfig()) throw new AppError("Les notifications ne sont pas disponibles sur ce serveur", 503);
  enforceRateLimit([[subscribeBudget, user.id]], "Trop de tentatives. Réessaie plus tard.");

  const userAgent = deviceLabel((await headers()).get("user-agent"));
  const existing = await prisma.pushSubscription.findMany({
    where: { userId: user.id },
    select: { id: true, endpoint: true, lastUsedAt: true },
  });
  const evict = subscriptionsToEvict(existing, endpoint);
  await prisma.$transaction([
    ...(evict.length > 0 ? [prisma.pushSubscription.deleteMany({ where: { id: { in: evict } } })] : []),
    prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent, userId: user.id },
      update: { p256dh: keys.p256dh, auth: keys.auth, userAgent, userId: user.id, lastUsedAt: new Date() },
    }),
  ]);
  return { message: "Notifications activées sur cet appareil" };
});

/** Forgets this browser (settings toggle off, sign-out). Only the caller's own subscription. */
export const unsubscribePush = action(pushEndpointSchema, async (endpoint) => {
  const user = await requireUser();
  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } });
  return { message: "Notifications désactivées sur cet appareil" };
});

/** Turns one push category on or off (for every device of the user). */
export const setPushCategory = action(pushCategorySchema, async ({ category, enabled }) => {
  const user = await requireUser();
  const { pushMutedCategories } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { pushMutedCategories: true },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { pushMutedCategories: toggleMutedCategory(pushMutedCategories, category, enabled) },
  });
  return { message: enabled ? "Catégorie activée" : "Catégorie désactivée" };
});
