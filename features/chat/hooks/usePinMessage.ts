import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessagesResponse } from "../types/chat.types";

interface PinMessageInput {
  messageId: string;
  conversationId: string;
  action: "pin" | "unpin";
}

interface PinMessageResponse {
  success: boolean;
  action: string;
  messageId: string;
  pinnedMessageIds: string[];
}

async function pinMessage(input: PinMessageInput): Promise<PinMessageResponse> {
  const response = await fetch("/api/chat/messages/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messageId: input.messageId,
      action: input.action,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de l'épinglage");
  }

  return response.json();
}

export function usePinMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pinMessage,
    onSuccess: (data, variables) => {
      // Update messages cache to reflect pin status
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
