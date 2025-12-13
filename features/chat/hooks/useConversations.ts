import { useQuery } from "@tanstack/react-query";
import { ConversationService } from "../services";
import type { ConversationsResponse } from "../types";

export function useConversations() {
  return useQuery<ConversationsResponse>({
    queryKey: ["conversations"],
    queryFn: ConversationService.getAll,
  });
}
