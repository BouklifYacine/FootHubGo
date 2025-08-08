import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EvenementComplet } from "@/features/evenements/types/TypesEvenements";
import { SchemaModificationStatsEquipe } from "../schema/ModifierStatsEquipeSchema";
import { ModifierStatsEquipeAction } from "../actions/ModifierStatsEquipeAction";

type MutationParams = {
  eventId: string;
  statsEquipeId: string;
  data: SchemaModificationStatsEquipe;
};

export function useModifierStatsEquipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, statsEquipeId, data }: MutationParams) => {
      const result = await ModifierStatsEquipeAction(data, eventId, statsEquipeId);
      if (!result?.success) throw new Error(result?.message);
      return result;
    },

    onMutate: async ({ eventId, data }: MutationParams) => {
      await queryClient.cancelQueries({
        queryKey: ["statistique", eventId],
      });

      const previousEvent = queryClient.getQueryData<EvenementComplet>([
        "statistique",
        eventId,
      ]);

      if (previousEvent && previousEvent.statsEquipe) {
        const updatedEvent: EvenementComplet = {
          ...previousEvent,
          statsEquipe: {
            ...previousEvent.statsEquipe,
            ...data, 
          },
        };

        queryClient.setQueryData<EvenementComplet>(
          ["statistique", eventId],
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
          ["statistique", variables.eventId],
          context.previousEvent
        );
      }
      toast.error(
        error.message || "Échec de la modification des stats d'équipe"
      );
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["statistique", variables.eventId],
      });
    },
  });
}