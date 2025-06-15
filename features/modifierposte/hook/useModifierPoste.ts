import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ModifierPosteAction } from "../actions/ModifierPosteAction";
import { InfosClubApiResponse } from "@/features/club/hooks/useinfosclub";
import toast from "react-hot-toast";

export type PosteType = "GARDIEN" | "DEFENSEUR" | "MILIEU" | "ATTAQUANT";

interface ModifierPosteparam {
  id: string;
  data: {
    poste: PosteType;
  };
}

export function useModifierPosteClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: ModifierPosteparam) => {
      const resultat = await ModifierPosteAction(id, data);
      if (!resultat?.success) throw new Error(resultat?.message);
      return resultat;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["infosclub"] });
      const anciennedonnees = queryClient.getQueryData<InfosClubApiResponse>([
        "infosclub",
      ]);

      if (anciennedonnees) {
        queryClient.setQueryData(["infosclub"], {
          ...anciennedonnees,
          membres: anciennedonnees.membres.map((m) =>
            m.userId === id ? { ...m, poste: data.poste } : m
          ),
        });
        return { anciennedonnees };
      }
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error, variables, context) => {
      if (context?.anciennedonnees) {
        queryClient.setQueryData(["infosclub"], context.anciennedonnees);
      }
      toast.error(error.message || "Échec de la modification du poste");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["infosclub"] });
    },
  });
}
