import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ServerActionResponse, StatistiqueEquipeInputs } from "../types/statistiquesequipetypes";
import { modifierStatistiqueEquipe } from "../actions/modifierstatistiqueequipe";
import toast from "react-hot-toast";

export function useModifierStatistiqueEquipe() {
  const queryClient = useQueryClient();

  return useMutation<ServerActionResponse, Error, { 
    evenementId: string; 
    equipeId: string; 
    data: StatistiqueEquipeInputs; 
  }>({
    mutationFn: ({ evenementId, equipeId, data }) => 
      modifierStatistiqueEquipe(evenementId, equipeId, data),
    
    onMutate: () => {
      toast.loading("Mise à jour des statistiques d'équipe...");
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
      toast.error("Une erreur est survenue lors de la modification des statistiques d'équipe");
    }
  });
}