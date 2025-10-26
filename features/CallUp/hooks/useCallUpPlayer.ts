import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convocationService } from "../services/convocation.service";
import {
  CallUpPlayerParams,
  ErrorResponse,
  TeamListInterface,
  CallUpResponse,
} from "../interfaces/CallUpInterface";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export function useCallUpPlayer() {
  const queryClient = useQueryClient();

  return useMutation<CallUpResponse,AxiosError<ErrorResponse>,CallUpPlayerParams,{ previousData: TeamListInterface | undefined }
  >({
    mutationFn: ({ eventId, playerId }: CallUpPlayerParams) =>
      convocationService.callUpPlayer(eventId, playerId),

    onMutate: async ({ teamId }) => {
      await queryClient.cancelQueries({ queryKey: ["TeamList", teamId] });

      const previousData = queryClient.getQueryData<TeamListInterface>([
        "TeamList",
        teamId,
      ]);

      return { previousData }; 
    },

    onError: (error, { teamId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["TeamList", teamId], context.previousData);
      }

      toast.error(error.response?.data?.message || "Erreur lors de la convocation");
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onSettled: (_, __, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["TeamList", teamId] });
    },
  });
}
