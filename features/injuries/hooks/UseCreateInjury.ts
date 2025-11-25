import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateInjuryTypeAPI } from "../types/CreateInjuries.types";
import { InjuryService } from "../services/InjuryService";
import { Blessure } from "@prisma/client";

export function useCreateInjury(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newInjury: Partial<CreateInjuryTypeAPI["injuryType"]>
    ) => {
      const data = await InjuryService.createInjury(newInjury);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["playerInjuries", id] });

      const previousInjuries = queryClient.getQueryData<Blessure[]>([
        "playerInjuries",
        id,
      ]);

      return { previousInjuries };
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: async (e, variables, context) => {
      if (context?.previousInjuries) {
        queryClient.setQueryData(
          ["playerInjuries", id],
          context.previousInjuries
        );
      }
      const errorMessage = e.message;

      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playerInjuries", id] });
      queryClient.invalidateQueries({ queryKey: ["clubInjuries"] });
    },
  });
}
