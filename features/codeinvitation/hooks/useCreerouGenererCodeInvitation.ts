"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InfosClubApiResponse } from "@/features/club/hooks/useinfosclub";
import toast from "react-hot-toast";
import { CreerouGenererCodeInvitation } from "../actions/CreerouGenererCodeInvitation";

export function useCreerouGenererCodeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipeId: string) => {
      const result = await CreerouGenererCodeInvitation(equipeId);
      if (!result?.success) throw new Error(result?.message);
      return result;
    },
    onMutate: async (equipeId) => {
      await queryClient.cancelQueries({ queryKey: ["infosclub", equipeId] });

      const previousData = queryClient.getQueryData<InfosClubApiResponse>([
        "infosclub",
      ]);

      // Génération d'un code temporaire côté client
      const tempCode = Math.floor(100000 + Math.random() * 900000).toString();

      if (previousData) {
        queryClient.setQueryData<InfosClubApiResponse>(["infosclub"], {
          ...previousData,
          equipe: {
            ...previousData.equipe,
            // codeInvitation: tempCode
          },
        });
      }

      return { previousData, tempCode };
    },
    onSuccess: (data, variables, context) => {
      toast.success(data?.message);

      // Mise à jour finale avec le vrai code du serveur
      if (context?.previousData) {
        queryClient.setQueryData<InfosClubApiResponse>(["infosclub"], {
          ...context.previousData,
          equipe: {
            ...context.previousData.equipe,
            codeInvitation: data.code!, // Utilisez le code réel du serveur
          },
        });
      }
    },
    onError: (error, equipeId, context) => {
      // Rollback en cas d'erreur
      if (context?.previousData) {
        queryClient.setQueryData(["infosclub"], context.previousData);
      }

      toast.error(
        error.message || "Échec de la génération du code d'invitation"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["infosclub"] });
    },
  });
}
