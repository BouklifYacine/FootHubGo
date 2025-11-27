import { useQuery } from "@tanstack/react-query";
import { NotificationsResponse } from "../types/notifications.types";

export function useNotificationsQuery(userId?: string) {
  return useQuery<NotificationsResponse>({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}
