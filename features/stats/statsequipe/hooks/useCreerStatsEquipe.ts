import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreerStatsEquipeAction } from "../actions/CreerStatsEquipeAction";
import toast from "react-hot-toast";
import { SchemaAjouterStatsEquipe } from "../schema/AjouterStatsEquipeSchema";

export function useCreerStatsEquipe(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SchemaAjouterStatsEquipe) => {
      const result = await CreerStatsEquipeAction(data, eventId);

      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },

    onError: (error) => {
      toast.error(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["statistique", eventId],
      });
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
}
