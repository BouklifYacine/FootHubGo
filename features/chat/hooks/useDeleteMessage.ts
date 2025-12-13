import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessagesResponse } from "../types/chat.types";
import { ChatService } from "../services/ChatService";

interface DeleteMessageInput {
  messageId: string;
  conversationId: string;
  type: "forMe" | "forAll";
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DeleteMessageInput) =>
      ChatService.deleteMessage(input.messageId),
    onSuccess: (data, variables) => {
      // Update messages cache
      queryClient.setQueryData<MessagesResponse>(
        ["messages", variables.conversationId],
        (old) => {
          if (!old) return old;

          if (variables.type === "forMe") {
            // Remove message from list
            return {
              ...old,
              messages: old.messages.filter(
                (msg) => msg.id !== variables.messageId
              ),
            };
          } else {
            // Mark as deleted for all (show placeholder)
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

      // Invalidate conversations to update last message if needed
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
