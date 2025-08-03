import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AjouterStatsJoueurAction } from "../actions/AjouterStatsJoueurAction";
import { schemaAjouterStatsJoueurSchema } from "../schema/AjouterStatsJoueurSchema";

export function useAjouterStatsJoueur(joueurid: string, eventid: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: schemaAjouterStatsJoueurSchema) => {
      const result = await AjouterStatsJoueurAction(data, joueurid, eventid);

      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["statistique", eventid],
      });
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });
}
