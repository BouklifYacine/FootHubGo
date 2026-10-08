import webpush, { WebPushError } from "web-push";
import { prisma } from "@/prisma";
import { loggableError } from "@/lib/errors";
import { wantsPush, type PushCategory } from "../categories";
import type { PushPayload } from "../payload";
import { isGoneStatus, isPushServiceEndpoint } from "../subscriptions";
import { pushConfig } from "./vapid";

/** How long a push service keeps an undelivered push (phone off): chat is stale sooner. */
const TTL_SECONDS: Record<PushCategory, number> = {
  callUps: 12 * 3600,
  motm: 12 * 3600,
  carpool: 12 * 3600,
  club: 24 * 3600,
  messages: 3600,
};

/**
 * Sends one push to every device of these users who did not mute the category.
 * - subscriptions answered 404 / 410 are deleted (expired or revoked by the user);
 * - NEVER throws: push is best effort, the in-app notification is already stored;
 * - logs counts and status codes only (no endpoint, no user id, no content).
 */
export async function sendPush(userIds: string[], category: PushCategory, payload: PushPayload) {
  try {
    const config = pushConfig();
    const ids = [...new Set(userIds)];
    if (!config || ids.length === 0) return { sent: 0, removed: 0, failed: 0 };

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: { in: ids } },
      select: { id: true, endpoint: true, p256dh: true, auth: true, user: { select: { pushMutedCategories: true } } },
    });
    // Rows stored before the push service allow-list: never POSTed to, dropped.
    const foreign = subscriptions.filter((sub) => !isPushServiceEndpoint(sub.endpoint)).map((sub) => sub.id);
    if (foreign.length > 0) await prisma.pushSubscription.deleteMany({ where: { id: { in: foreign } } });
    const targets = subscriptions.filter(
      (sub) => isPushServiceEndpoint(sub.endpoint) && wantsPush(category, sub.user.pushMutedCategories),
    );
    if (targets.length === 0) return { sent: 0, removed: 0, failed: 0 };

    const body = JSON.stringify(payload);
    const options: webpush.RequestOptions = {
      TTL: TTL_SECONDS[category],
      urgency: category === "messages" || category === "callUps" ? "high" : "normal",
      vapidDetails: config,
      timeout: 10_000,
    };

    const delivered: string[] = [];
    const gone: string[] = [];
    let failed = 0;
    await Promise.all(
      targets.map(async (sub) => {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, body, options);
          delivered.push(sub.id);
        } catch (error) {
          const status = error instanceof WebPushError ? error.statusCode : undefined;
          if (isGoneStatus(status)) gone.push(sub.id);
          else {
            failed += 1;
            console.warn(`[push] delivery failed (${status ?? (error instanceof Error ? error.name : "error")})`);
          }
        }
      }),
    );

    if (gone.length > 0) await prisma.pushSubscription.deleteMany({ where: { id: { in: gone } } });
    if (delivered.length > 0) {
      await prisma.pushSubscription.updateMany({ where: { id: { in: delivered } }, data: { lastUsedAt: new Date() } });
    }
    return { sent: delivered.length, removed: gone.length, failed };
  } catch (error) {
    console.error("[push] sendPush failed", loggableError(error));
    return { sent: 0, removed: 0, failed: 0 };
  }
}
