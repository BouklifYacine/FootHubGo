import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessagesResponse } from "../types/chat.types";

interface DeleteMessageInput {
  messageId: string;
  conversationId: string;
  type: "forMe" | "forAll";
}

interface DeleteMessageResponse {
  success: boolean;
  type: string;
  messageId: string;
}

async function deleteMessage(
  input: DeleteMessageInput
): Promise<DeleteMessageResponse> {
  const response = await fetch(
    `/api/chat/messages/${input.messageId}?type=${input.type}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la suppression");
  }

  return response.json();
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: (data, variables) => {
      // Update messages cache
      queryClient.setQueryData<MessagesResponse>(
        ["messages", variables.conversationId],
        (old) => {
          if (!old) return old;

          if (data.type === "forMe") {
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
