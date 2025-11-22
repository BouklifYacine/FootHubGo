import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { CreateInjuryTypeAPI } from "../types/CreateInjuries.types";
import { CreateInjuryService } from "../services/CreateInjuryService";

export function useCreateInjury() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInjury: Partial<CreateInjuryTypeAPI["injuryType"]>) => {
      const data = await CreateInjuryService.createinjuryresponse(newInjury);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["injury"] });
      const previousData = queryClient.getQueryData<CreateInjuryTypeAPI>(["injury"]);

      if (previousData) {
        queryClient.setQueryData(["injury"], {
          ...previousData,
        });
        return { previousData };
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: async (error: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["injury"], context.previousData);
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
        } catch (e) {
        }
      }

      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["injury"] });
    },
  });
}
