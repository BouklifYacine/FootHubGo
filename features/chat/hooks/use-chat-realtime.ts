"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query/keys";
import { useSocketEvent } from "@/lib/realtime/use-socket-event";
import { insertMessage, setConversations, setMessages, updateConversation, updateMessages } from "../cache";

/**
 * Applies every chat socket event to the query cache. Mount it ONCE (chat page).
 * Handlers go through `useSocketEvent`: they always see the latest session and never re-subscribe.
 */
export function useChatRealtime() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const myId = session?.user.id;

  const refetchConversations = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations });

  useSocketEvent("chat:message", (message) => {
    setMessages(queryClient, message.conversationId, (data) => insertMessage(data, message));
    const known = queryClient
      .getQueryData<{ id: string }[]>(queryKeys.chat.conversations)
      ?.some((c) => c.id === message.conversationId);
    if (!known) return void refetchConversations();
    updateConversation(queryClient, message.conversationId, (c) => ({
      ...c,
      lastMessage: message,
      updatedAt: message.createdAt,
      unreadCount: message.senderId === myId ? c.unreadCount : c.unreadCount + 1,
    }));
  });

  useSocketEvent("chat:message_deleted", ({ conversationId, messageId, forEveryone }) => {
    setMessages(queryClient, conversationId, (data) =>
      updateMessages(data, (messages) =>
        forEveryone
          ? messages.map((m) => (m.id === messageId ? { ...m, content: "", deletedForAll: true } : m))
          : messages.filter((m) => m.id !== messageId),
      ),
    );
    void refetchConversations(); // last message preview
  });

  // Read receipts: someone else read the conversation, so my messages are read.
  useSocketEvent("chat:read", ({ conversationId, userId }) => {
    if (userId === myId) return;
    setMessages(queryClient, conversationId, (data) =>
      updateMessages(data, (messages) => messages.map((m) => (m.senderId === userId ? m : { ...m, read: true }))),
    );
  });

  useSocketEvent("chat:conversation_updated", () => void refetchConversations());

  useSocketEvent("chat:conversation_removed", ({ conversationId }) => {
    setConversations(queryClient, (list) => list.filter((c) => c.id !== conversationId));
    queryClient.removeQueries({ queryKey: queryKeys.chat.messages(conversationId) });
  });

  useSocketEvent("presence:changed", ({ userId, isOnline }) =>
    setConversations(queryClient, (list) =>
      list.map((c) => ({
        ...c,
        participants: c.participants.map((p) => (p.id === userId ? { ...p, isOnline } : p)),
      })),
    ),
  );

  // Events are not received once the chat is closed: mark its cache stale for the next visit.
  useEffect(
    () => () => void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all, refetchType: "none" }),
    [queryClient],
  );
}
