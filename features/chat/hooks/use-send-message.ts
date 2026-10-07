"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { sendMessage } from "../actions/messages";
import { insertMessage, PENDING_PREFIX, setMessages } from "../cache";
import type { MessagesData } from "../types";

/**
 * Sends a message with an optimistic bubble. The server response (or the socket event,
 * whichever comes first) replaces it; a failure rolls it back and shows a toast.
 */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useActionMutation(sendMessage, {
    toast: false,
    optimistic: {
      queryKey: queryKeys.chat.messages(conversationId),
      update: (old, input) =>
        insertMessage(old as MessagesData | undefined, {
          id: `${PENDING_PREFIX}${crypto.randomUUID()}`,
          conversationId,
          content: input.content.trim(),
          senderId: session?.user.id ?? "",
          senderName: session?.user.name ?? "",
          senderImage: session?.user.image ?? null,
          createdAt: new Date().toISOString(),
          read: false,
          deletedForAll: false,
        }),
    },
    onSuccess: (message) => setMessages(queryClient, conversationId, (data) => insertMessage(data, message)),
  });
}
