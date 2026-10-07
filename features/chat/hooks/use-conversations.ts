"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { createConversation, deleteConversation, pinConversation, setUserBlocked } from "../actions/conversations";
import { removeGroupMember } from "../actions/groups";
import { markConversationRead } from "../actions/messages";
import { setConversations } from "../cache";
import type { ConversationDto } from "../types";

const invalidate = [queryKeys.chat.conversations];

const conversationsQuery = {
  queryKey: queryKeys.chat.conversations,
  queryFn: () => fetchJson<ConversationDto[]>("/api/chat/conversations"),
};

/** The user's conversations, kept live by `useChatRealtime`. */
export function useConversations() {
  return useQuery(conversationsQuery);
}

/** Total of unread messages (sidebar badge). Shares the conversations cache with the chat page. */
export function useUnreadMessagesCount(enabled: boolean) {
  const { data = 0 } = useQuery({
    ...conversationsQuery,
    enabled,
    select: (conversations) => conversations.reduce((total, c) => total + c.unreadCount, 0),
  });
  return data;
}

/** Adds the conversation to the list right away so it can be opened before the refetch. */
export function useCreateConversation(onCreated: (conversation: ConversationDto) => void) {
  const queryClient = useQueryClient();
  return useActionMutation(createConversation, {
    invalidate,
    toast: false,
    onSuccess: (conversation) => {
      setConversations(queryClient, (list) =>
        list.some((c) => c.id === conversation.id) ? list : [conversation, ...list],
      );
      onCreated(conversation);
    },
  });
}

export const usePinConversation = () => useActionMutation(pinConversation, { invalidate });

export const useDeleteConversation = () => useActionMutation(deleteConversation, { invalidate });

export const useLeaveGroup = () => useActionMutation(removeGroupMember, { invalidate });

export const useSetUserBlocked = () => useActionMutation(setUserBlocked, { invalidate });

/** Clears the unread badge right away; the server then tells the senders (read receipts). */
export const useMarkConversationRead = () =>
  useActionMutation(markConversationRead, {
    toast: false,
    optimistic: {
      queryKey: queryKeys.chat.conversations,
      update: (old, conversationId) =>
        (old as ConversationDto[] | undefined)?.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    },
  });
