import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { EvenementComplet } from "@/features/evenements/types/TypesEvenements";
import { modifierStatsJoueurAction } from "../actions/ModifierStatsJoueurAction";
import { TypeModifierStatsJoueurSchema } from "../schema/ModifierStatsJoueurSchema";

type MutationParams = {
  eventId: string;
  joueurid: string;
  statistiqueid: string;
  data: TypeModifierStatsJoueurSchema;
};

export function useModifierStatsJoueur() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, joueurid, statistiqueid, data }: MutationParams) => {
      const result = await modifierStatsJoueurAction(
        eventId,
        joueurid,
        statistiqueid,
        data
      );
      if (!result?.success) throw new Error(result?.message);
      return result;
    },

    onMutate: async ({ eventId, statistiqueid, data }: MutationParams) => {
      await queryClient.cancelQueries({
        queryKey: ["statistique", eventId],
      });

      const previousEvent = queryClient.getQueryData<EvenementComplet>([
        "statistique",
        eventId,
      ]);

      if (previousEvent) {

        const updatedStats = previousEvent.statsJoueurs.map((stats) => stats.id === statistiqueid ? {...stats, ...data} : stats)

        const optimisticEvent: EvenementComplet = {   ...previousEvent, statsJoueurs: updatedStats };

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
        error.message || "Échec de la modification des stats du joueur"
      );
    },

    onSettled: (data, error, variables) => {

      queryClient.invalidateQueries({
        queryKey: ["statistique", variables.eventId],
      });
    },
  });
}