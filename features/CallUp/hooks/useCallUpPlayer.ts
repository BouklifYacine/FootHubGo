import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convocationService } from "../services/convocation.service";
import {
  CallUpPlayerParams,
  ErrorResponse,
  TeamListInterfaceAPI,
  CallUpResponse,
} from "../interfaces/CallUpInterface";
import { toast } from "sonner";
import { HTTPError } from "ky";
import { getHttpErrorMessage } from "@/lib/http-error";

export function useCallUpPlayer() {
  const queryClient = useQueryClient();

  return useMutation<CallUpResponse,HTTPError<ErrorResponse>,CallUpPlayerParams,{ previousData: TeamListInterfaceAPI | undefined }
  >({
    mutationFn: ({ eventId, playerId }: CallUpPlayerParams) =>
      convocationService.callUpPlayer(eventId, playerId),

    onMutate: async ({ teamId,eventId }) => {
      await queryClient.cancelQueries({ queryKey: ["TeamList", teamId, eventId] });

      const previousData = queryClient.getQueryData<TeamListInterfaceAPI>(["TeamList", teamId, eventId]);

      return { previousData }; 
    },

    onError: (error, { teamId,eventId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["TeamList", teamId, eventId], context.previousData);
      }

      toast.error(getHttpErrorMessage(error, "Erreur lors de la convocation"));
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onSettled: (_, __, { teamId,eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["TeamList", teamId, eventId] });
    },
  });
}
