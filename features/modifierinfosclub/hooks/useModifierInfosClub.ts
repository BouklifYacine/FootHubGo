import { SchemaModifierInfosClub } from "@/features/modifierinfosclub/schemas/SchemaModifierInfosClub";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ModifierInfosClubAction } from "../actions/modifierinfosclubaction";
import z from "zod";

type schema = z.infer<typeof SchemaModifierInfosClub>

export function useModifierInfosClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clubId, clubData }: { 
      clubId: string; 
      clubData: schema 
    }) => {
      const result = await ModifierInfosClubAction(clubId, clubData);
      if (!result.success) throw new Error(result.message);
      return result;
    },
    onMutate: async ({ clubId, clubData }) => {
      await queryClient.cancelQueries({ queryKey: ['infosclub', clubId] });

      const anciennesDonneesClub = queryClient.getQueryData(['infosclub', clubId]);

      if (anciennesDonneesClub) {
        queryClient.setQueryData(['infosclub', clubId], (ancienClub: schema) => ({
          ...ancienClub,
          ...clubData
        }));
      }

      return { anciennesDonneesClub };
    },
    onSuccess: (resultat) => {
      toast.success(resultat.message);
    },
    onError: (erreur, { clubId }, contexte) => {
      if (contexte?.anciennesDonneesClub) {
        queryClient.setQueryData(['infosclub', clubId], contexte.anciennesDonneesClub);
      }
      toast.error(erreur.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['infosclub'] });
    }
  });
}