import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getHttpErrorMessage } from "@/lib/http-error";
import { CreateInjuryTypeAPI } from "../types/CreateInjuries.types";
import { InjuryService } from "../services/InjuryService";
import { Blessure } from "@/generated/prisma/browser";
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
        errorMessage = getHttpErrorMessage(error, errorMessage);
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
