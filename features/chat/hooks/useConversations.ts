import { useQuery } from "@tanstack/react-query";
import { ChatService } from "../services/ChatService";
import { ConversationsResponse } from "../types/chat.types";

export function useConversations() {
  return useQuery<ConversationsResponse>({
    queryKey: ["conversations"],
    queryFn: ChatService.getConversations,
  });
}
