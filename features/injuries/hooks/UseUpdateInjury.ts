import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateInjuryTypeAPI } from "../types/CreateInjuries.types";
import { InjuryService } from "../services/InjuryService";
import { Blessure } from "@/generated/prisma/browser";

export function useUpdateInjury(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateInjuryTypeAPI["injuryType"]>;
    }) => {
      return await InjuryService.updateInjury(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({
        queryKey: ["playerInjuries", sessionId],
      });

      const previousInjuries = queryClient.getQueryData<Blessure[]>([
        "playerInjuries",
        sessionId,
      ]);

      queryClient.setQueryData<Blessure[]>(
        ["playerInjuries", sessionId],
        (old) =>
          old?.map((injury) =>
            injury.id === id ? { ...injury, ...data } : injury
          ) || []
      );

      return { previousInjuries };
    },
    onSuccess: () => {
      toast.success("Blessure mise à jour avec succès");
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousInjuries) {
        queryClient.setQueryData(
          ["playerInjuries", sessionId],
          context.previousInjuries
        );
      }
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["playerInjuries", sessionId],
      });
      queryClient.invalidateQueries({ queryKey: ["clubInjuries"] });
    },
  });
}
