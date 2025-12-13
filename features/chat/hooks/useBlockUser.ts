import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface BlockUserInput {
  userId: string;
  action: "block" | "unblock";
}

interface BlockStatusResponse {
  isBlockedByMe: boolean;
  isBlockedByThem: boolean;
  canChat: boolean;
}

async function blockUser(input: BlockUserInput) {
  const response = await fetch("/api/users/block", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors du blocage/déblocage");
  }

  return response.json();
}

async function getBlockStatus(targetId: string): Promise<BlockStatusResponse> {
  const response = await fetch(`/api/users/block?targetId=${targetId}`);
  if (!response.ok) {
    throw new Error("Erreur lors de la récupération du statut");
  }
  return response.json();
}

export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: blockUser,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["blockStatus", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}

export function useBlockStatus(targetId: string | undefined) {
  return useQuery({
    queryKey: ["blockStatus", targetId],
    queryFn: () => getBlockStatus(targetId!),
    enabled: !!targetId,
  });
}
