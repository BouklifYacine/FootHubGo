import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Message, MessagesResponse } from "../types/chat.types";

export function useChatWebSocket(
  userId: string | undefined,
  conversationId: string | null
) {
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

    socket.on("connect", () => {
      console.log("✅ Chat WebSocket connected");
      // Join user's room to receive messages
      socket.emit("chat:join", { userId });
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Chat WebSocket disconnected:", reason);
    });

    // Listen for new messages
    socket.on("chat:message", (message: Message) => {
      console.log("📩 New chat message:", message);

      // Update messages cache for the conversation
      queryClient.setQueryData<MessagesResponse>(
        ["messages", message.conversationId],
        (old) => {
          if (!old) return old;

          // Avoid duplicates
          if (old.messages.some((m) => m.id === message.id)) return old;

          return {
            ...old,
            messages: [...old.messages, message],
          };
        }
      );

      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    // Listen for read receipts
    socket.on(
      "chat:read",
      (data: { conversationId: string; userId: string; readAt: string }) => {
        queryClient.setQueryData<MessagesResponse>(
          ["messages", data.conversationId],
          (old) => {
            if (!old) return old;

            return {
              ...old,
              messages: old.messages.map((msg) =>
                msg.senderId === userId && !msg.read
                  ? { ...msg, read: true, readAt: data.readAt }
                  : msg
              ),
            };
          }
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [userId, queryClient]);

  // Return function to emit messages (optional, since we also use REST API)
  return {
    // Socket is managed internally
  };
}
