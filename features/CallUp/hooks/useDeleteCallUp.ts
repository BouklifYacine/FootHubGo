import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ErrorResponse,
  TeamListInterfaceAPI,
  CallUpResponse,
} from "../interfaces/CallUpInterface";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { DeleteCallUpParams } from "../interfaces/DeleteCallUpInterface";
import { deleteCallUpService } from "../services/deleteCallUp.service";

export function useDeleteCallUp() {
  const queryClient = useQueryClient();

  return useMutation<CallUpResponse,AxiosError<ErrorResponse>,DeleteCallUpParams,{ previousData: TeamListInterfaceAPI | undefined }
  >({
    mutationFn: ({ callUpId }: DeleteCallUpParams) =>
      deleteCallUpService.DeleteCallUp(callUpId),

    onMutate: async ({ teamId,eventId, callUpId }) => {
      await queryClient.cancelQueries({ queryKey: ["TeamList", teamId, eventId] });

      const previousData = queryClient.getQueryData<TeamListInterfaceAPI>(["TeamList", teamId, eventId]);

       if (previousData) {
    const updatedData = {
      ...previousData,
      equipe: {
        ...previousData.equipe,
        membres: previousData.equipe.membres.map(membre => ({
          ...membre,
          convocations: membre.convocations.filter((callup) => callup.id !== callUpId )
        }))
      }
    };
    
    queryClient.setQueryData(["TeamList", teamId, eventId], updatedData);
  }

      return { previousData }; 
    },

    onError: (error, { teamId,eventId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["TeamList", teamId, eventId], context.previousData);
      }

      toast.error(error.response?.data?.message || "Erreur lors de la convocation");
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onSettled: (_, __, { teamId,eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["TeamList", teamId, eventId] });
    },
  });
}
