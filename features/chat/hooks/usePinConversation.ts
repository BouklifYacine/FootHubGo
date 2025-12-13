import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationsResponse } from "../types/chat.types";

interface PinConversationInput {
  conversationId: string;
  action: "pin" | "unpin";
}

interface PinConversationResponse {
  success: boolean;
  action: string;
  conversationId: string;
  isPinned: boolean;
}

async function pinConversation(
  input: PinConversationInput
): Promise<PinConversationResponse> {
  const response = await fetch("/api/chat/conversations/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de l'épinglage");
  }

  return response.json();
}

export function usePinConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pinConversation,
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
