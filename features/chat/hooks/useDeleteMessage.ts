import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageService } from "../services";
import type { MessagesResponse, DeleteMessageInput } from "../types";

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteMessageInput) =>
      MessageService.delete(input.messageId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<MessagesResponse>(
        ["messages", variables.conversationId],
        (old) => {
          if (!old) return old;

          if (variables.type === "forMe") {
            return {
              ...old,
              messages: old.messages.filter(
                (msg) => msg.id !== variables.messageId
              ),
            };
          } else {
            return {
              ...old,
              messages: old.messages.map((msg) =>
                msg.id === variables.messageId
                  ? { ...msg, content: "", deletedForAll: true }
                  : msg
              ),
            };
          }
        }
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
