import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supprimerStatistiqueJoueur } from "../actions/SupprimerStatistiqueJoueuraction";
import toast from "react-hot-toast";

export function useSupprimerStatistiqueJoueur() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (evenementId: string) => supprimerStatistiqueJoueur(evenementId),
    
    onMutate: () => {
      toast.loading("Suppression des statistiques...");
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
      toast.error("Une erreur est survenue lors de la suppression des statistiques");
    }
  });
}