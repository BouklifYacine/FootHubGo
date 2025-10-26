import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convocationService } from "../services/convocation.service";
import { CallUpPlayerParams, Convocation, ErrorResponse } from "../interfaces/CallUpInterface";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export function useCallUpPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, playerId }: CallUpPlayerParams) =>
      convocationService.callUpPlayer(eventId, playerId),

    onMutate: async ({ eventId, playerId }) => {
      await queryClient.cancelQueries({ queryKey: ["TeamList", eventId] });

      const previousConvocations = queryClient.getQueryData<Convocation[]>([
        "TeamList",
        eventId,
      ]);

      queryClient.setQueryData<Convocation[]>(
        ["TeamList", eventId],
        (old = []) => [
          ...old,
          {
            id: `temp-${Date.now()}`,
            userId: playerId,
            evenementId: eventId,
            statut: "EN_ATTENTE",
            dateEnvoi: new Date(),
          },
        ]
      );

      return { previousConvocations };
    },

    onError: (error: AxiosError<ErrorResponse>, { eventId }, context) => {
      if (context?.previousConvocations) {
        queryClient.setQueryData(
          ["Convocations", eventId],
          context.previousConvocations
        );
      }
      
      toast.error(error.response?.data?.message || "Erreur lors de la convocation");
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onSettled: (_, __, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: ["TeamList", eventId] });
    },
  });
}
