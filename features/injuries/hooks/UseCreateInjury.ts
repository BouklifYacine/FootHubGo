import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CreateInjuryTypeAPI } from "../types/CreateInjuries.types";
import { InjuryService } from "../services/InjuryService";
import { Blessure } from "@prisma/client";
import { HTTPError } from "ky"; // Important : on importe le type d'erreur de Ky

export function useCreateInjury(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInjury: Partial<CreateInjuryTypeAPI["injuryType"]>) => {
      return await InjuryService.createInjury(newInjury);
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
    onError: async (error: unknown, variables, context) => {
      if (context?.previousInjuries) {
        queryClient.setQueryData(
          ["playerInjuries", id],
          context.previousInjuries
        );
      }

      let errorMessage = "Erreur lors de la création de la blessure";
      if (error instanceof HTTPError) {
         const errorData = await error.response.json<{ message: string }>();
          errorMessage = errorData.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["playerInjuries", id] });
      queryClient.invalidateQueries({ queryKey: ["clubInjuries"] });
    },
  });
}
