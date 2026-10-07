"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useSocketEvent } from "@/lib/realtime/use-socket-event";
import { markAllNotificationsRead, markNotificationRead } from "../actions";
import type { NotificationList } from "../server/queries";

/** Same as NOTIFICATION_LIMIT on the server (not imported: server-only module). */
const LIMIT = 10;

/** Latest notifications, kept live by the realtime socket. */
export function useNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => fetchJson<NotificationList>("/api/notifications"),
  });

  useSocketEvent("notification:new", (notification) => {
    queryClient.setQueryData<NotificationList>(queryKeys.notifications.all, (old) => {
      if (!old || old.notifications.some((n) => n.id === notification.id)) return old;
      return {
        notifications: [notification, ...old.notifications].slice(0, LIMIT),
        unreadCount: old.unreadCount + 1,
      };
    });
  });

  return query;
}

export function useMarkNotificationRead() {
  return useActionMutation(markNotificationRead, {
    toast: false,
    invalidate: [queryKeys.notifications.all],
    optimistic: {
      queryKey: queryKeys.notifications.all,
      update: (old, notificationId) => {
        const list = old as NotificationList | undefined;
        if (!list) return list;
        const wasUnread = list.notifications.some((n) => n.id === notificationId && !n.read);
        return {
          notifications: list.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
          unreadCount: wasUnread ? Math.max(0, list.unreadCount - 1) : list.unreadCount,
        };
      },
    },
  });
}

export function useMarkAllNotificationsRead() {
  return useActionMutation(markAllNotificationsRead, {
    toast: false,
    invalidate: [queryKeys.notifications.all],
    optimistic: {
      queryKey: queryKeys.notifications.all,
      update: (old) => {
        const list = old as NotificationList | undefined;
        if (!list) return list;
        return { notifications: list.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 };
      },
    },
  });
}
