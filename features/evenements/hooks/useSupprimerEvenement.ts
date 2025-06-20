import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SupprimerEvenementAction } from "../actions/SupprimerEvenementAction";
import { EvenementsAPI } from "../types/TypesEvenements";
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

      if (previousData) {
        queryClient.setQueryData(["evenements"], {
          ...previousData,
          membres: previousData.evenements.filter((m) => m.id !== id),
        });
        return { previousData };
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["evenements"] });
    },
  });
}
