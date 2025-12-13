import { useQuery } from "@tanstack/react-query";
import { MessageService } from "../services";
import type { MessagesResponse } from "../types";

export function useMessages(conversationId: string | null) {
  return useQuery<MessagesResponse>({
    queryKey: ["messages", conversationId],
    queryFn: () => MessageService.getByConversation(conversationId!),
    enabled: !!conversationId,
  });
}
