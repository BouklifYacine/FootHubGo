"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DeleteEvenementErrorResponse, DeleteEvenementResponse, DeleteEvenementSuccessResponse } from "../types/DeleteEvenementResponse";
import { deleteEvenement } from "../actions/DeleteEvenement-Action";


export function useDeleteEvenement(equipeId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation<DeleteEvenementResponse, Error, string>({
    mutationFn: async (evenementId: string) => {
      return await deleteEvenement(equipeId, evenementId);
    },

    onMutate: () => {
      toast.loading("Suppression de l'événement en cours...");
    },

    onSuccess: (result) => {
      toast.dismiss();

      if (result.success) {
        const successResult = result as DeleteEvenementSuccessResponse;
        toast.success(successResult.message || "Événement supprimé avec succès");
        
        // Invalider les requêtes concernées
        queryClient.invalidateQueries({ 
          queryKey: ["evenements-equipe", equipeId] 
        });
        
        // Rediriger vers la liste des événements
        router.push(`/dashboardclient/evenements/${equipeId}`);
      } else {
        const errorResult = result as DeleteEvenementErrorResponse;
        toast.error(errorResult.error || errorResult.message || "Échec de la suppression de l'événement");
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la suppression de l'événement"
      );
    },
  });

  return {
    deleteEvenement: mutation.mutate,
    isPending: mutation.isPending,
  };
} 