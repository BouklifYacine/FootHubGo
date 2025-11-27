import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { NotificationsResponse } from "../types/notifications.types";

export function useNotificationsMutations(userId?: string) {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", userId] });
      const previousData = queryClient.getQueryData<NotificationsResponse>([
        "notifications",
        userId,
      ]);

      queryClient.setQueryData<NotificationsResponse>(
        ["notifications", userId],
        (old) => {
          if (!old) return old;

          const notification = old.notifications.find(
            (n) => n.id === notificationId
          );
          const wasUnread = notification && !notification.read;

          return {
            notifications: old.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: wasUnread
              ? Math.max(0, old.unreadCount - 1)
              : old.unreadCount,
          };
        }
      );

      return { previousData };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["notifications", userId],
          context.previousData
        );
      }
      toast.error("Impossible de marquer comme lue");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to mark all as read");
      return response.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications", userId] });

      const previousData = queryClient.getQueryData<NotificationsResponse>([
        "notifications",
        userId,
      ]);

      queryClient.setQueryData<NotificationsResponse>(
        ["notifications", userId],
        (old) => {
          if (!old) return old;
          return {
            notifications: old.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          };
        }
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["notifications", userId],
          context.previousData
        );
      }
      toast.error("Impossible de marquer tout comme lu");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}
