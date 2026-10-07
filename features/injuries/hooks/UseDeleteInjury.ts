import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InjuryService } from "../services/InjuryService";
import { Blessure } from "@/generated/prisma/browser";

export function useDeleteInjury(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await InjuryService.deleteInjury(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["playerInjuries", sessionId],
      });

      const previousInjuries = queryClient.getQueryData<Blessure[]>([
        "playerInjuries",
        sessionId,
      ]);

      queryClient.setQueryData<Blessure[]>(
        ["playerInjuries", sessionId],
        (old) => old?.filter((injury) => injury.id !== id) || []
      );

      return { previousInjuries };
    },
    onSuccess: () => {
      toast.success("Blessure supprimée avec succès");
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousInjuries) {
        queryClient.setQueryData(
          ["playerInjuries", sessionId],
          context.previousInjuries
        );
      }
      toast.error(error.message || "Erreur lors de la suppression");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["playerInjuries", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["clubInjuries"] });
    },
  });
}
