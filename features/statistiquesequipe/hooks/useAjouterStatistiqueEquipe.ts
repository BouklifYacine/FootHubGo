import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ajouterStatistiqueEquipe } from "../actions/ajouterstatistiqueequipeaction";
import toast from "react-hot-toast";
import { StatistiqueEquipeInputs } from "../types/statistiquesequipetypes";

export function useAjouterStatistiqueEquipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ evenementId, equipeId, data }: { 
      evenementId: string; 
      equipeId: string; 
      data: StatistiqueEquipeInputs 
    }) => ajouterStatistiqueEquipe(evenementId, equipeId, data),
    
    onSuccess: (response, variables) => {
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
      toast.error("Une erreur est survenue lors de l'ajout des statistiques d'équipe");
    }
  });
}