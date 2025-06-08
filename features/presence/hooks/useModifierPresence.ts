import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreerPresenceParams, Presence, PresenceRetour, PresenceUpdateContext, ResultatAction } from "../types/Presencetypes";
import { modifierPresence } from "../actions/ModifierPresence";
import toast from "react-hot-toast";

export const useModifierPresence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ evenementId, statut, userId }: CreerPresenceParams) => {
      return await modifierPresence(evenementId, statut, userId);
    },
    onMutate: async ({ evenementId, statut }: CreerPresenceParams) => {
      await queryClient.cancelQueries({ queryKey: ["mes-presences"] });
      await queryClient.cancelQueries({ queryKey: ["presences", evenementId] });

      const previousPresences = queryClient.getQueryData<Presence[]>(["mes-presences"]);
      const previousEvenementPresences = queryClient.getQueryData<Presence[]>(["presences", evenementId]);

      if (previousPresences) {
        const presenceIndex = previousPresences.findIndex(p => p.evenementId === evenementId);
        
        if (presenceIndex >= 0) {
          const updatedPresences = [...previousPresences];
          updatedPresences[presenceIndex] = {
            ...updatedPresences[presenceIndex],
            statut: statut
          };
          
          queryClient.setQueryData(["mes-presences"], updatedPresences);
        }
      }

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
      toast.error("Erreur lors de la modification de la présence");
    },
    onSuccess: (resultat: ResultatAction<PresenceRetour>, variables) => {
      if (resultat.success) {
        queryClient.invalidateQueries({ queryKey: ["mes-presences"] });
        queryClient.invalidateQueries({ queryKey: ["presences", variables.evenementId] });
        queryClient.invalidateQueries({ queryKey: ["evenements"] });
      }
      return resultat;
    }
  });
}; 