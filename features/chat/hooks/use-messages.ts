"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchJson, withQuery } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { deleteMessage } from "../actions/messages";
import type { MessagesPage } from "../types";

/** Messages of a conversation, newest page first; `fetchNextPage` loads older messages. */
export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.chat.messages(conversationId),
    queryFn: ({ pageParam }) =>
      fetchJson<MessagesPage>(
        withQuery(`/api/chat/conversations/${conversationId}/messages`, { cursor: pageParam }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    // Kept fresh by socket events; refetched after a reconnect.
    staleTime: Infinity,
  });
}

/** The realtime "chat:message_deleted" event updates the cache (this tab included). */
export const useDeleteMessage = () => useActionMutation(deleteMessage, { toast: false });
