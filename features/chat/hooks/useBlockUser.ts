import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MemberService } from "../services";
import type { BlockUserInput, BlockStatusResponse } from "../types";

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BlockUserInput) => MemberService.block(input),
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
    queryFn: () => MemberService.getBlockStatus(targetId!),
    enabled: !!targetId,
  });
}
