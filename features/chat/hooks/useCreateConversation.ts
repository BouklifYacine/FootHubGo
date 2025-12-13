import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationService } from "../services";
import type {
  CreateConversationInput,
  CreateConversationResponse,
} from "../types";

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateConversationInput
    ): Promise<CreateConversationResponse> => ConversationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversations"],
      });
    },
  });
}
