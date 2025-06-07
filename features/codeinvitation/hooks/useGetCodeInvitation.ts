import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { supprimerCodeInvitation } from "../actions/SupprimerCodeInvitation";
import { CodeInvitationResponse } from "../types/codeinvitationtypes";

export function useCodeInvitation(equipeId: string) {
  const queryClient = useQueryClient();

  const genererCode = useMutation({
    mutationFn: async () => {
      const { data } = await axios.get<CodeInvitationResponse>(
        `/api/equipes/${equipeId}/codeinvitation`
      );
      return data;
    },

    onMutate: () => {
      toast.loading("Génération du code d'invitation...");
    },

    onSuccess: (result) => {
      toast.dismiss();

      if (result.codeInvitation) {
        toast.success(result.message);
        queryClient.invalidateQueries({
          queryKey: ["membre-equipe", equipeId],
        });
      } else {
        toast.error(result.message);
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(
        error.message || "Erreur lors de la génération du code d'invitation"
      );
    },
  });

  const supprimerCode = useMutation({
    mutationFn: async () => {
      return await supprimerCodeInvitation(equipeId);
    },

    onMutate: () => {
      toast.loading("Suppression du code d'invitation...");
    },

    onSuccess: (result) => {
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({
          queryKey: ["membre-equipe", equipeId],
        });
      } else {
        toast.error(result.message);
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(
        error.message || "Erreur lors de la suppression du code d'invitation"
      );
    },
  });

  return {
    genererCode: genererCode.mutate,
    supprimerCode: supprimerCode.mutate,
    isGenerating: genererCode.isPending,
    isDeleting: supprimerCode.isPending,
  };
}