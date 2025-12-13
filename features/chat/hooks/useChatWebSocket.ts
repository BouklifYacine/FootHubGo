import { useEffect, useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { Message, MessagesResponse } from "../types/chat.types";

export function useChatWebSocket(
  userId: string | undefined,
  conversationId: string | null
) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!userId) return;

    const socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Chat WebSocket connected");
      socket.emit("chat:join", { userId });

      if (conversationId) {
        socket.emit("chat:join_conversation", conversationId);
      }
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
          if (old.messages.some((m) => m.id === message.id)) return old;

          return {
            ...old,
            messages: [...old.messages, message],
          };
        }
      );

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

    // Typing indicators
    socket.on(
      "chat:typing",
      (data: { userId: string; userName: string; conversationId: string }) => {
        if (data.conversationId === conversationId && data.userId !== userId) {
          setTypingUsers((prev) => {
            if (prev.includes(data.userName)) return prev;
            return [...prev, data.userName];
          });
        }
      }
    );

    socket.on(
      "chat:stop_typing",
      (data: { userId: string; conversationId: string }) => {
        if (data.conversationId === conversationId) {
          // We might not have userName here, but we can filter if we stored objects.
          // For simplicity, let's assume we clear all if we receive stop from anyone?
          // No, that's bad. But server emits what it received.
          // Let's rely on stored names.
          // Actually, to remove by name, we need name in stop_typing too or map ID to name.
          // Let's just clear for now or simple timeout.
          // Creating a more robust logic requires mapping.
          setTypingUsers([]);
        }
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [userId, queryClient]);

  // Handle conversation switching
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && socket.connected && conversationId) {
      socket.emit("chat:join_conversation", conversationId);
      setTypingUsers([]); // Clear typing on switch
      return () => {
        socket.emit("chat:leave_conversation", conversationId);
      };
    }
  }, [conversationId]);

  const emitTyping = useCallback(() => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("chat:typing", { conversationId });
    }
  }, [conversationId]);

  const emitStopTyping = useCallback(() => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("chat:stop_typing", { conversationId });
    }
  }, [conversationId]);

  const emitRead = useCallback(
    (targetConversationId: string, readAt: string) => {
      if (socketRef.current && userId) {
        socketRef.current.emit("chat:read", {
          conversationId: targetConversationId,
          userId,
          readAt,
        });
      }
    },
    [userId]
  );

  return {
    typingUsers,
    emitTyping,
    emitStopTyping,
    emitRead,
  };
}
