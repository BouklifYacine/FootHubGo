import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import z from "zod";
import { ModifierEvenementAction } from "../actions/ModifierEvenementAction";
import { ModifierEvenementSchema } from "../schemas/ModificationEvenementsSchema";

type schema = z.infer<typeof ModifierEvenementSchema>;

export function useModifierEvenement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: schema }) => {
      const result = await ModifierEvenementAction(id, data);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["evenements", id] });

      const anciennesData = queryClient.getQueryData<schema>([
        "evenements",
        id,
      ]);

      if (anciennesData) {
        queryClient.setQueryData<schema>(["evenements", id], (DataduCache) =>
          DataduCache ? { ...DataduCache, ...data } : DataduCache
        );
      }

      return { anciennesData };
    },
    onSuccess: (resultat) => {
      toast.success(resultat.message);
    },
    onError: (erreur, { id }, contexte) => {
      if (contexte?.anciennesData) {
        queryClient.setQueryData(["evenements", id], contexte.anciennesData);
      }
      toast.error(erreur.message);
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["evenements", id],
      });
    },
  });
}
