import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SupprimerJoueurClubAction } from "../actions/SupprimerJoueurClubaction";
import { InfosClubApiResponse } from "@/features/club/hooks/useinfosclub";
import toast from "react-hot-toast";

export function useSupprimerJoueurClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const resultat = await SupprimerJoueurClubAction(id);
      if (!resultat?.success) throw new Error(resultat?.message);
      return resultat;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["infosclub"] });
      const previousData = queryClient.getQueryData<InfosClubApiResponse>([
        "infosclub",
      ]);

      if (previousData) {
        queryClient.setQueryData(["infosclub"], {
          ...previousData,
          membres: previousData.membres.filter((m) => m.id !== id),
        });
        return { previousData };
      }
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error, equipeId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["infosclub"], context.previousData);
      }

      toast.error(
        error.message  || "Échec de la suppression du joueur"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["infosclub"] });
    },
  });
}
