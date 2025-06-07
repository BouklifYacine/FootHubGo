import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { rejoindreEquipeCodeInvitation } from "../actions/rejoindreEquipeCodeInvitation";
import { RejoindreEquipeInput } from "../types/codeinvitationtypes";

export function useRejoindreEquipeCodeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RejoindreEquipeInput) => {
      return await rejoindreEquipeCodeInvitation(data);
    },

    onMutate: () => {
      toast.loading("Traitement en cours...");
    },

    onSuccess: (data) => {
      toast.dismiss();

      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["equipes"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        toast.error(data.message);
      }
    },

    onError: () => {
      toast.dismiss();
      toast.error("Une erreur est survenue");
    },
  });
}