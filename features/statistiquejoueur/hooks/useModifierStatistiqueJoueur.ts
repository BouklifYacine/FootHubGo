import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StatistiqueJoueurInputs } from "../types/StatsJoueurTypes";
import { modifierStatistiqueJoueur } from "../actions/ModifierStatistiquesJoueurAction";
import toast from "react-hot-toast";

export function useModifierStatistiqueJoueur() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ evenementId, data }: { evenementId: string; data: StatistiqueJoueurInputs }) => 
      modifierStatistiqueJoueur(evenementId, data),
    
    onMutate: () => {
      toast.loading("Mise à jour des statistiques...");
    },
    
    onSuccess: (response) => {
      toast.dismiss();
      if (response.success) {
        toast.success(response.message);
        // Invalider les requêtes pour forcer le rafraîchissement des données
        queryClient.invalidateQueries({ queryKey: ["evenements"] });
        queryClient.invalidateQueries({ queryKey: ["evenements-equipe"] });
        queryClient.invalidateQueries({ queryKey: ["statistique-evenement"] });
      } else {
        toast.error(response.message);
      }
    },
    
    onError: () => {
      toast.dismiss();
      toast.error("Une erreur est survenue lors de la modification des statistiques");
    }
  });
}
