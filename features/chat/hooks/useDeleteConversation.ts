import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ConversationService } from "../services";
import { toast } from "sonner";

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      ConversationService.delete(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation supprimée");
    },
    onError: () => {
      toast.error("Erreur", {
        description: "Impossible de supprimer la conversation.",
      });
    },
  });
}
