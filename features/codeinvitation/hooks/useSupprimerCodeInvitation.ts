"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SupprimerCodeInvitation } from "../actions/Supprimercodeinvitation";
import { InfosClubApiResponse } from "@/features/club/hooks/useinfosclub";
import toast from "react-hot-toast";


export function useSupprimerCodeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipeId: string) => {
      const result = await SupprimerCodeInvitation(equipeId);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onMutate: async (equipeId) => {
      // Annuler les requêtes en cours
      await queryClient.cancelQueries({ queryKey: ["infosclub", equipeId], });

      const previousData = queryClient.getQueryData<InfosClubApiResponse>([
        "infosclub",
      ]);

      // Mise à jour optimiste
      if (previousData) {
        queryClient.setQueryData<InfosClubApiResponse>(["infosclub"], {
          ...previousData,
          equipe: {
            ...previousData.equipe,
            codeInvitation: null,
          },
        });
      }

      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error, equipeId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["infosclub"], context.previousData);
      }
      
      toast.error(
        error.message || "Échec de la suppression du code d'invitation"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["infosclub"] });
    },
  });
}