import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EvenementComplet } from "@/features/evenements/types/TypesEvenements";
import { SupprimerStatsJoueurAction } from "../actions/SupprimerStatsJoueurAction";

type MutationParams = {
  eventId: string;
  joueurid: string;
  statistiqueid: string;
};

export function useSupprimerStatsJoueur() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, joueurid, statistiqueid}: MutationParams) => {
      const result = await SupprimerStatsJoueurAction(
        eventId,
        joueurid,
        statistiqueid
      );
      if (!result?.success) throw new Error(result?.message);
      return result;
    },

    onMutate: async ({ eventId, statistiqueid }: MutationParams) => {
      await queryClient.cancelQueries({
        queryKey: ["statistique", eventId],
      });

      const previousEvent = queryClient.getQueryData<EvenementComplet>([
        "statistique",
        eventId,
      ]);

      if (previousEvent) {
        const filteredStats = previousEvent.statsJoueurs.filter(
          (s) => s.id !== statistiqueid
        );

        const optimisticEvent: EvenementComplet = {
          ...previousEvent,
          statsJoueurs: filteredStats,
        };

        queryClient.setQueryData<EvenementComplet>(
          ["statistique", eventId],
          optimisticEvent
        );
      }

      return { previousEvent };
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error, variables, context) => {
      if (context?.previousEvent) {
        queryClient.setQueryData(
          ["statistique", variables.eventId],
          context.previousEvent
        );
      }
      toast.error(
        error.message || "Échec de la suppression des stats du joueur"
      );
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["statistique", variables.eventId],
      });
    },
  });
}
