"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useSocketEvent } from "@/lib/realtime/use-socket-event";
import { markAllNotificationsRead, markNotificationRead } from "../actions";
import type { NotificationList } from "../server/queries";

/** Same as NOTIFICATION_LIMIT on the server (not imported: server-only module). */
const LIMIT = 10;

/** Latest notifications (cache only: mount `useNotifications` once to keep it live). */
export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => fetchJson<NotificationList>("/api/notifications"),
  });
}

/** Latest notifications, kept live by the realtime socket (+ a toast). Mounted once, by the bell. */
export function useNotifications() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const query = useNotificationsQuery();

  useSocketEvent("notification:new", (notification) => {
    const url = notification.url;
    toast(notification.title, {
      description: notification.message,
      action: url ? { label: "Voir", onClick: () => router.push(url) } : undefined,
    });
    // What the notification is about changed: call-ups, requests, badges.
    void queryClient.invalidateQueries({ queryKey: queryKeys.me.badges });
    void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    // Not loaded yet (or a fetch is in flight): refetch so the notification can't be lost.
    const key = queryKeys.notifications.all;
    if (!queryClient.getQueryData(key) || queryClient.isFetching({ queryKey: key })) {
      void queryClient.invalidateQueries({ queryKey: key });
      return;
    }
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
