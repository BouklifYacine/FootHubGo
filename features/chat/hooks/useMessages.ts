import { useQuery } from "@tanstack/react-query";
import { ChatService } from "../services/ChatService";
import { MessagesResponse } from "../types/chat.types";

export function useMessages(conversationId: string | null) {
  return useQuery<MessagesResponse>({
    queryKey: ["messages", conversationId],
    queryFn: () => ChatService.getMessages(conversationId!),
    enabled: !!conversationId,
  });
}
