import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChatService,
  BlockUserInput,
  BlockStatusResponse,
} from "../services/ChatService";

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BlockUserInput) => ChatService.blockUser(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["blockStatus", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useBlockStatus(targetId: string | undefined) {
  return useQuery<BlockStatusResponse>({
    queryKey: ["blockStatus", targetId],
    queryFn: () => ChatService.getBlockStatus(targetId!),
    enabled: !!targetId,
  });
}
