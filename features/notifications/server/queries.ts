import { prisma } from "@/prisma";
import type { Notification } from "@/generated/prisma/client";
import type { NotificationDto } from "@/lib/realtime/protocol";

/** How many notifications the bell shows. */
export const NOTIFICATION_LIMIT = 10;

export function toNotificationDto(notification: Notification): NotificationDto {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    fromUserName: notification.fromUserName,
    fromUserImage: notification.fromUserImage,
  };
}

/** Latest notifications + unread count. Fetching them counts as delivering the missed ones. */
export async function getNotifications(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: NOTIFICATION_LIMIT,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  await prisma.notification.updateMany({
    where: { userId, delivered: false },
    data: { delivered: true },
  });

  return { notifications: notifications.map(toNotificationDto), unreadCount };
}

export type NotificationList = Awaited<ReturnType<typeof getNotifications>>;
