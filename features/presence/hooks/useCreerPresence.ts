import { useMutation, useQueryClient } from "@tanstack/react-query";
import { creerPresence } from "../actions/CreerPresence";
import { CreerPresenceParams, Presence, PresenceRetour, PresenceUpdateContext, ResultatAction } from "../types/Presencetypes";
import toast from "react-hot-toast";

export const useCreerPresence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ evenementId, statut, userId }: CreerPresenceParams) => {
      return await creerPresence(evenementId, statut, userId);
    },
    // Optimistic update
    onMutate: async ({ evenementId, statut }: CreerPresenceParams) => {
      // Annuler les requêtes en cours pour éviter les écrasements
      await queryClient.cancelQueries({ queryKey: ["mes-presences"] });
      await queryClient.cancelQueries({ queryKey: ["presences", evenementId] });

      // Sauvegarder l'état précédent pour le rollback
      const previousPresences = queryClient.getQueryData<Presence[]>(["mes-presences"]);
      const previousEvenementPresences = queryClient.getQueryData<Presence[]>(["presences", evenementId]);

      // Mettre à jour de manière optimiste le state mes-presences
      if (previousPresences) {
        const presenceIndex = previousPresences.findIndex(p => p.evenementId === evenementId);
        
        if (presenceIndex >= 0) {
          // Mettre à jour une présence existante
          const updatedPresences = [...previousPresences];
          updatedPresences[presenceIndex] = {
            ...updatedPresences[presenceIndex],
            statut: statut
          };
          
          queryClient.setQueryData(["mes-presences"], updatedPresences);
        } else {
     
        }
      }

      // Mettre à jour de manière optimiste le state presences/evenementId
      if (previousEvenementPresences) {
        const presenceIndex = previousEvenementPresences.findIndex(p => p.evenementId === evenementId);
        
        if (presenceIndex >= 0) {
          const updatedPresences = [...previousEvenementPresences];
          updatedPresences[presenceIndex] = {
            ...updatedPresences[presenceIndex],
            statut: statut
          };
          
          queryClient.setQueryData(["presences", evenementId], updatedPresences);
        }
      }

      // Retourner le contexte pour être utilisé en cas d'erreur
      return { 
        previousPresences, 
        previousEvenementPresences 
      } as PresenceUpdateContext;
    },
    // En cas d'erreur, on revient à l'état précédent
    onError: (err, variables, context) => {
      if (context?.previousPresences) {
        queryClient.setQueryData(["mes-presences"], context.previousPresences);
      }
      if (context?.previousEvenementPresences) {
        queryClient.setQueryData(
          ["presences", variables.evenementId], 
          context.previousEvenementPresences
        );
      }
      toast.error("Erreur lors de la mise à jour de la présence. Veuillez réessayer.");
    },
    // En cas de succès, on invalide quand même les queries pour s'assurer d'avoir les données à jour
    onSuccess: (resultat: ResultatAction<PresenceRetour>, variables) => {
      if (resultat.success) {
        queryClient.invalidateQueries({ queryKey: ["mes-presences"] });
        queryClient.invalidateQueries({ queryKey: ["presences", variables.evenementId] });
        // Si la page d'événements est ouverte, on la rafraîchit aussi
        queryClient.invalidateQueries({ queryKey: ["evenements"] });
      }
      return resultat;
    },
    // On refetch une fois la mutation terminée
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mes-presences"] });
      queryClient.invalidateQueries({ queryKey: ["presences", variables.evenementId] });
    }
  });
};