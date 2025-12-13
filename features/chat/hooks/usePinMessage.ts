import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageService } from "../services";
import type { MessagesResponse, PinMessageInput } from "../types";

export function usePinMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PinMessageInput) =>
      MessageService.pin({
        conversationId: input.conversationId,
        messageId: input.messageId,
      }),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<MessagesResponse>(
        ["messages", variables.conversationId],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: old.messages.map((msg) =>
              msg.id === variables.messageId
                ? { ...msg, isPinned: variables.action === "pin" }
                : msg
            ),
          };
        }
      );
    },
  });
}
