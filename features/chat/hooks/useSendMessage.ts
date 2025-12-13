import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "../services/ChatService";
import { SendMessageInput, Message } from "../types/chat.types";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageInput) => ChatService.sendMessage(data),
    onSuccess: (newMessage: Message, variables) => {
      // Optimistically update messages cache
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      // Update conversations list to show latest message
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
