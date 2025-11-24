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
    onMutate: async (newInjury) => {
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
    onError: async (error: any, variables, context) => {
      if (context?.previousInjuries) {
        queryClient.setQueryData(
          ["playerInjuries", id],
          context.previousInjuries
        );
      }

      let errorMessage = error.message;

      if (error.response) {
        try {
          const errorData = await error.response.json();
          if (errorData) {
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          }
        } catch (e) {}
      }

      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playerInjuries", id] });
      queryClient.invalidateQueries({ queryKey: ["clubInjuries"] });
    },
  });
}
