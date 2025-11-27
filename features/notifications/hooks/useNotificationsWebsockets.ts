import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { NotificationsResponse } from "../types/notifications.types";
import { Notification } from "@prisma/client";

export function useNotificationsWebSocket(userId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", async () => {
      console.log("✅ Connecté au WebSocket");

      try {
        const response = await fetch("/api/notifications/undelivered");
        if (response.ok) {
          const missedNotifications = await response.json();

          if (missedNotifications.length > 0) {
            queryClient.setQueryData<NotificationsResponse>(
              ["notifications", userId],
              (old) => {
                if (!old) return old;

                const existingIds = new Set(old.notifications.map((n) => n.id));
                const newOnes = missedNotifications.filter(
                  (n: Notification) => !existingIds.has(n.id)
                );

                return {
                  notifications: [...newOnes, ...old.notifications].slice(
                    0,
                    10
                  ),
                  unreadCount: old.unreadCount + newOnes.length,
                };
              }
            );
          }
        }
      } catch (error) {
        console.error("Error fetching undelivered notifications:", error);
      }
    });

    socket.on("disconnect", (reason) => {
      if (reason !== "io client disconnect") {
        toast.error("Connexion perdue, reconnexion...", {
          id: "socket-status",
        });
      }
    });

    socket.on("reconnect", () => {
      toast.success("Connecté ✓", {
        id: "socket-status",
        duration: 2000,
      });
    });

    socket.on("notification", (notif: Notification) => {
      console.log("📩 Nouvelle notification:", notif);

      queryClient.setQueryData<NotificationsResponse>(
        ["notifications", userId],
        (old) => {
          if (!old) return old;

          if (old.notifications.some((n) => n.id === notif.id)) return old;

          return {
            notifications: [notif, ...old.notifications].slice(0, 10),
            unreadCount: old.unreadCount + 1,
          };
        }
      );
    });

    socket.on("connect_error", (error) => {
      if (
        error.message.includes("Authentication") ||
        error.message.includes("session")
      ) {
        toast.error("Session expirée, reconnectez-vous");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, queryClient]);
}
