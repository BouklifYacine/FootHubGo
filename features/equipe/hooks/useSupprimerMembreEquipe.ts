import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { supprimerMembreEquipe } from "../actions/supprimermembreequipeaction";

export function useSupprimerMembreDEquipe(equipeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membreId: string) => {
      return await supprimerMembreEquipe(equipeId, membreId);
    },

    onMutate: () => {
      toast.loading("Suppression du membre en cours...");
    },

    onSuccess: (result) => {
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);
        // Invalider les requêtes liées à l'équipe et aux membres
        queryClient.invalidateQueries({
          queryKey: ["membre-equipe", equipeId],
        });
        queryClient.invalidateQueries({ queryKey: ["equipes"] });
      } else {
        toast.error(result.message);
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(error.message || "Erreur lors de la suppression du membre");
    },
  });
}
