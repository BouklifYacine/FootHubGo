import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationService } from "../services";
import type {
  ConversationsResponse,
  PinConversationInput,
  PinConversationResponse,
} from "../types";

export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      input: PinConversationInput
    ): Promise<PinConversationResponse> => ConversationService.pin(input),
    onSuccess: (data) => {
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
