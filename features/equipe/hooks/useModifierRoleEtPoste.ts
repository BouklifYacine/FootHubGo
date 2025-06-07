import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { modifierRoleEtPoste } from "../actions/modifierroleetposteaction";

export function useModifierRoleEtPoste(equipeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      membreId: string;
      role: "ENTRAINEUR" | "JOUEUR";
      posteJoueur?: "GARDIEN" | "DEFENSEUR" | "MILIEU" | "ATTAQUANT";
    }) => {
      const mutationData = {
        membreId: data.membreId,
        role: data.role,
        posteJoueur: data.role === "ENTRAINEUR" ? undefined : data.posteJoueur,
      };

      return await modifierRoleEtPoste(equipeId, data.membreId, mutationData);
    },

    onMutate: () => {
      toast.loading("Modification du rôle en cours...");
    },

    onSuccess: (result) => {
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({
          queryKey: ["membre-equipe", equipeId],
        });
        queryClient.invalidateQueries({ queryKey: ["equipes"] });
      } else {
        toast.error(result.message);
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(error.message || "Erreur lors de la modification du rôle");
    },
  });
}