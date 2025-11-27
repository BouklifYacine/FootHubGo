import { useNotificationsMutations } from "./useAllReadNotifications";
import { useNotificationsQuery } from "./useNotificationsQuery";
import { useNotificationsWebSocket } from "./useNotificationsWebsockets";

export function useNotifications(userId?: string) {
  const { data, isLoading, error } = useNotificationsQuery(userId);

  const { markAsRead, markAllAsRead, isMarkingAsRead, isMarkingAllAsRead } =
    useNotificationsMutations(userId);

  useNotificationsWebSocket(userId);

  return {
    notifications: data?.notifications ?? [],
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
  };
}
