import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supprimerPresence } from "../actions/SupprimerPresence";
import { Presence, PresenceUpdateContext, ResultatAction, StatutPresence } from "../types/Presencetypes";

export const useSupprimerPresence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ evenementId, userId }: { evenementId: string; userId?: string }) => {
      return await supprimerPresence(evenementId, userId);
    },
    // Optimistic update
    onMutate: async ({ evenementId }) => {
      // Annuler les requêtes en cours pour éviter les écrasements
      await queryClient.cancelQueries({ queryKey: ["mes-presences"] });
      await queryClient.cancelQueries({ queryKey: ["presences", evenementId] });

      // Sauvegarder l'état précédent pour le rollback
      const previousPresences = queryClient.getQueryData<Presence[]>(["mes-presences"]);
      const previousEvenementPresences = queryClient.getQueryData<Presence[]>(["presences", evenementId]);

      if (previousPresences) {
        const updatedPresences = previousPresences.filter(p => p.evenementId !== evenementId);
        queryClient.setQueryData(["mes-presences"], updatedPresences);
      }

      if (previousEvenementPresences) {
        const updatedPresences = previousEvenementPresences.map(p => 
          p.evenementId === evenementId 
            ? { ...p, statut: "EN_ATTENTE" as StatutPresence } 
            : p
        );
        queryClient.setQueryData(["presences", evenementId], updatedPresences);
      }

      return { 
        previousPresences, 
        previousEvenementPresences 
      } as PresenceUpdateContext;
    },
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
      toast.error("Erreur lors de la suppression de la présence. Veuillez réessayer.");
    },

    onSuccess: (resultat: ResultatAction<void>, variables) => {
      if (resultat.success) {
        queryClient.invalidateQueries({ queryKey: ["mes-presences"] });
        queryClient.invalidateQueries({ queryKey: ["presences", variables.evenementId] });
        queryClient.invalidateQueries({ queryKey: ["evenements"] });
      }
      return resultat;
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mes-presences"] });
      queryClient.invalidateQueries({ queryKey: ["presences", variables.evenementId] });
    }
  });
};
