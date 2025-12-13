import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "../services/ChatService";
import {
  CreateConversationInput,
  CreateConversationResponse,
} from "../types/chat.types";

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateConversationInput
    ): Promise<CreateConversationResponse> =>
      ChatService.createConversation(data),
    onSuccess: () => {
      // Invalidate conversations list
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
