import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SupprimerStatsEquipeAction } from "../actions/SupprimerStatsEquipeAction";
import { EvenementComplet } from "@/features/evenements/types/TypesEvenements";

type MutationParams = {
  eventId: string;
  statsEquipeId: string;
};

export function useSupprimerStatsEquipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, statsEquipeId }: MutationParams) => {
      const result = await SupprimerStatsEquipeAction(eventId, statsEquipeId);
      if (!result?.success) throw new Error(result?.message);
      return result;
    },

    onMutate: async ({ eventId, statsEquipeId }: MutationParams) => {
      await queryClient.cancelQueries({
        queryKey: ["statistique", eventId, statsEquipeId],
      });

      const previousEvent = queryClient.getQueryData<EvenementComplet>([
        "statistique",
        eventId,
      ]);

      if (previousEvent) {
        // Création d'une copie mise à jour sans les stats supprimées
        const updatedEvent: EvenementComplet = {
          ...previousEvent,
          statsEquipe: null,
          statsJoueurs: [],
        };

        queryClient.setQueryData<EvenementComplet>(
          ["statistique", eventId, statsEquipeId],
          updatedEvent
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
          ["statistique", variables.eventId, variables.statsEquipeId],
          context.previousEvent
        );
      }
      toast.error(
        error.message || "Échec de la suppression des stats d'équipe"
      );
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["statistique", variables.eventId, variables.statsEquipeId],
      });
      queryClient.invalidateQueries({
        queryKey: ["evenements"],
      });
    },
  });
}
