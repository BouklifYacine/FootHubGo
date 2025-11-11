import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SupprimerEvenementAction } from "../actions/SupprimerEvenementAction";
import { Evenements, EvenementsAPI } from "../types/TypesEvenements";
import toast from "react-hot-toast";

export function useSupprimerEvenement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const resultat = await SupprimerEvenementAction(id);
      if (!resultat?.success) throw new Error(resultat?.message);
      return resultat;
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["evenements"] });
      const previousData = queryClient.getQueryData<EvenementsAPI>([
        "evenements",
      ]);
      const previousEvenement = queryClient.getQueryData<Evenements>([
        "evenements",
        id,
      ]);

      if (previousData) {
        queryClient.setQueryData(["evenements"], {
          ...previousData,
          membres: previousData.evenements.filter((m) => m.id !== id),
        });
        return { previousData };
      }

      if (previousEvenement) {
        queryClient.setQueryData(["evenements", id], {
          ...previousEvenement,
        });
        return { previousEvenement };
      }
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error, equipeId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["evenements"], context.previousData);
      }

      toast.error(error.message || "Échec de la suppression du joueur");
    },
    onSettled: (data, error,id) => {
      queryClient.invalidateQueries({ queryKey: ["evenements"] });
      queryClient.invalidateQueries({ queryKey: ["evenements", id] });
      queryClient.invalidateQueries({ queryKey: ["accueil"]})    },
  });
}
