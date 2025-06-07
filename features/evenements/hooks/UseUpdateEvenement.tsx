"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { UpdateEvenementErrorResponse, UpdateEvenementResponse, UpdateEvenementSuccessResponse } from "../types/UpdateEvenementResponse";
import { updateEvenement } from "../actions/UpdateEvenement-Action";


export function useUpdateEvenement(equipeId: string, evenementId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<UpdateEvenementResponse, Error, UpdateEvenement>({
    mutationFn: async (donnees: UpdateEvenement) => {
      return await updateEvenement(donnees, equipeId, evenementId);
    },

    onMutate: () => {
      toast.loading("Mise à jour de l'événement en cours...");
    },

    onSuccess: (result) => {
      toast.dismiss();

      if (result.success) {
        const successResult = result as UpdateEvenementSuccessResponse;
        toast.success(successResult.message || "Événement mis à jour avec succès");
        
        // Invalider les requêtes concernées
        queryClient.invalidateQueries({ 
          queryKey: ["evenements-equipe", equipeId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ["evenement", evenementId] 
        });
        
        // Rediriger vers la liste des événements
        router.push(`/dashboardclient/evenements/${equipeId}`);
      } else {
        const errorResult = result as UpdateEvenementErrorResponse;
        toast.error(errorResult.error || errorResult.message || "Échec de la mise à jour de l'événement");

        if (errorResult.details) {
          console.error("Détails des erreurs:", errorResult.details);
        }
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la mise à jour de l'événement"
      );
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
} 