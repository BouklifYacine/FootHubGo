import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageService } from "../services";
import type { SendMessageInput, Message } from "../types";

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageInput) => MessageService.send(data),
    onSuccess: (response: { message: Message }, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
