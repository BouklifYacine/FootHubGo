import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supprimerStatistiqueEquipe } from "../actions/supprimerstatistiqueequipeaction";
import toast from "react-hot-toast";
import { ServerActionResponse } from "../types/statistiquesequipetypes";

export function useSupprimerStatistiqueEquipe() {
  const queryClient = useQueryClient();

  return useMutation<ServerActionResponse, Error, {
    evenementId: string;
    equipeId: string;
  }>({
    mutationFn: ({ evenementId, equipeId }) => 
      supprimerStatistiqueEquipe(evenementId, equipeId),
    
    onMutate: () => {
      toast.loading("Suppression des statistiques d'équipe...");
    },
    
    onSuccess: (response, variables) => {
      toast.dismiss();
      if (response.success) {
        toast.success(response.message);
        // Invalider les requêtes pour forcer le rafraîchissement des données
        queryClient.invalidateQueries({ queryKey: ["evenements"] });
        queryClient.invalidateQueries({ queryKey: ["evenements-equipe"] });
        queryClient.invalidateQueries({ 
          queryKey: ["statistique-equipe-evenement", variables.evenementId, variables.equipeId] 
        });
      } else {
        toast.error(response.message);
      }
    },
    
    onError: () => {
      toast.dismiss();
      toast.error("Une erreur est survenue lors de la suppression des statistiques d'équipe");
    }
  });
}
