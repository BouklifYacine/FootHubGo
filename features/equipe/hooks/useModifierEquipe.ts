import { useMutation, useQueryClient } from "@tanstack/react-query";
import { modifierEquipe } from "../actions/modifierequipeation";
import toast from "react-hot-toast";
import { ModifierEquipeInputs } from "../schemas/SchemaEquipe";

export function useModifierEquipe(equipeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ModifierEquipeInputs) => {
      return await modifierEquipe(equipeId, data);
    },

    onMutate: () => {
      toast.loading("Mise à jour des informations...");
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

    onError: () => {
      toast.dismiss();
      toast.error("Erreur lors de la modification de l'équipe");
    },
  });
}