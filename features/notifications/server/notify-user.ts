import { prisma } from "@/prisma";
import type { NotificationType } from "@/generated/prisma/client";
import { emitToUser, isUserConnected } from "@/server/realtime/emitter";
import { toNotificationDto } from "./queries";

export type NotifyUserInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  fromUserName?: string | null;
  fromUserImage?: string | null;
};

/**
 * Persists a notification and pushes it in realtime to the user's open tabs.
 * `delivered` is only set when a socket actually received it; otherwise the next
 * fetch of the notification list picks it up (see `getNotifications`).
 */
export async function notifyUser(input: NotifyUserInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      fromUserName: input.fromUserName ?? undefined,
      fromUserImage: input.fromUserImage ?? undefined,
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

/** Notifies several users in parallel. */
export function notifyUsers(userIds: string[], input: Omit<NotifyUserInput, "userId">) {
  return Promise.all(userIds.map((userId) => notifyUser({ ...input, userId })));
}
