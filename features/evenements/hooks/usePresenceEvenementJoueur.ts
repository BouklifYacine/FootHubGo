import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PresenceEvenementJoueurAction } from "../actions/PresenceEvenementJoueurAction";
import { CreationPresenceSchema } from "@/features/presences/schemas/presenceschemas";
import z from "zod";
import { ReponseModifierPresenceAPI } from "../types/TypesEvenements";
import toast from "react-hot-toast";

type schema = z.infer<typeof CreationPresenceSchema>;

interface Params {
  data: schema;
  evenementid: string;
}

export function usePresenceEvenementJoueur() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ evenementid, data }: Params) => {
      const result = await PresenceEvenementJoueurAction(evenementid, data);
      if (!result.success) throw new Error(result?.message);
      return result;
    },

    onMutate: async (evenementid) => {
      await queryClient.cancelQueries({
        queryKey: ["evenements", evenementid],
      });
      const anciennedata = queryClient.getQueryData<ReponseModifierPresenceAPI>(
        ["evenements"]
      );

      if (anciennedata) {
        queryClient.setQueryData<ReponseModifierPresenceAPI>(["evenements"], {
          ...anciennedata,
          presence: {
            ...anciennedata.presence,
          },
        });
      }

      return { anciennedata };
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error, evenementsid, context) => {
      if (context?.anciennedata) {
        queryClient.setQueryData(["evenements"], context.anciennedata);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["evenements"] });
    },
  });
}
