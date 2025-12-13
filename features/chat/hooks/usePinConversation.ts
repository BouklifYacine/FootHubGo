import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationsResponse } from "../types/chat.types";
import {
  ChatService,
  PinConversationInput,
  PinConversationResponse,
} from "../services/ChatService";

export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: PinConversationInput
    ): Promise<PinConversationResponse> => ChatService.pinConversation(input),
    onSuccess: (data) => {
      // Update conversations cache to reflect pin status
      queryClient.setQueryData<ConversationsResponse>(
        ["conversations"],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            conversations: old.conversations.map((conv) =>
              conv.id === data.conversationId
                ? { ...conv, isPinned: data.isPinned }
                : conv
            ),
          };
        }
      );
    },
  });
}
