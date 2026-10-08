import { prisma } from "@/prisma";
import type { NotificationType } from "@/generated/prisma/client";
import { emitToUser, isUserConnected } from "@/server/realtime/emitter";
import { pushCategoryOf } from "@/features/push/categories";
import { notificationPayload } from "@/features/push/payload";
import { sendPush } from "@/features/push/server/send-push";
import { toNotificationDto } from "./queries";

export type NotifyUserInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  fromUserName?: string | null;
  fromUserImage?: string | null;
  /** Page the notification opens: a path of the app (e.g. `/app/events/<id>`), also used by the push. */
  url?: string;
};

/**
 * Persists a notification, sends it in realtime to the user's open tabs and by Web Push to their
 * devices (see `pushNotification`).
 */
export async function notifyUser(input: NotifyUserInput) {
  const dto = await storeAndEmit(input);
  pushNotification([input.userId], input);
  return dto;
}

/** Notifies several users in parallel (one push batch for all of them). */
export async function notifyUsers(userIds: string[], input: Omit<NotifyUserInput, "userId">) {
  const dtos = await Promise.all(userIds.map((userId) => storeAndEmit({ ...input, userId })));
  pushNotification(userIds, input);
  return dtos;
}

/**
 * Web Push, when the type pushes (`pushCategoryOf`, features/push/categories.ts) and the user kept
 * that category on. The ONLY place notifications are pushed. Not awaited: it never delays nor
 * breaks the caller (`sendPush` never throws).
 */
function pushNotification(userIds: string[], input: Omit<NotifyUserInput, "userId">) {
  const category = pushCategoryOf(input.type);
  if (!category || userIds.length === 0) return;
  void sendPush(userIds, category, notificationPayload(input));
}

/**
 * Stores the notification and emits it to the user's open tabs. `delivered` is only set when a
 * socket actually received it; otherwise the next fetch of the notification list picks it up
 * (see `getNotifications`).
 */
async function storeAndEmit(input: NotifyUserInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      fromUserName: input.fromUserName ?? undefined,
      fromUserImage: input.fromUserImage ?? undefined,
      data: input.url ? { url: input.url } : undefined,
    },
  });
  const dto = toNotificationDto(notification);

  try {
    if (await isUserConnected(input.userId)) {
      emitToUser(input.userId, "notification:new", dto);
      await prisma.notification.update({ where: { id: notification.id }, data: { delivered: true } });
    }
  } catch (error) {
    // Realtime is best effort: the notification is stored either way.
    console.error("[notifications] realtime push failed", error);
  }

  return dto;
}
