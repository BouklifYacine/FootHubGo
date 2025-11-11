import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import z from "zod";
import { RejoindreEquipeSchema } from "../schema/schemaRejoindreEquipe";
import { RejoindreEquipeAction } from "../actions/RejoindreEquipeAction";

type schema = z.infer<typeof RejoindreEquipeSchema>;
type CreationClubResult = {
  success: boolean;
  message: string;
};

export function useRejoindreEquipe() {
  const queryClient = useQueryClient();

  return useMutation<CreationClubResult, Error, schema>({
    mutationFn: async (data) => {
      const result = await RejoindreEquipeAction(data);
      // Si jamais CreationClubAction peut throw, tu peux throw ici pour onError
      if (!result) throw new Error("Erreur inconnue");
      return result;
    },

    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du club");
    },
    onSuccess: (data) => {
      toast.dismiss();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
        queryClient.invalidateQueries({ queryKey: ["clubs"] });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["infosclub"] })
    },
  });
}
