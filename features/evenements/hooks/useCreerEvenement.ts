import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreerEvenementAction } from "../actions/CreerEvenementAction";
import { CreationEvenementSchema } from "../schemas/CreationEvenementsSchema";
import z from "zod";
import { EvenementsAPI } from "../types/TypesEvenements";
import toast from "react-hot-toast";

type schema = z.infer<typeof CreationEvenementSchema>;
type CreationEvenement = {
  success: boolean;
  message: string;
};

export function useCreerEvenement() {
  const queryClient = useQueryClient();

  return useMutation<CreationEvenement, Error, schema>({
    mutationFn: async (data) => {
      const resultat = await CreerEvenementAction(data);
      if (!resultat?.success) throw new Error(resultat?.message);
      return resultat;
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["evenements"] });

      const anciennedata = queryClient.getQueryData<EvenementsAPI>([
        "evenements",
      ]);

      if (anciennedata?.evenements) {
        queryClient.setQueryData<EvenementsAPI>(["evenements"], {
          ...anciennedata,
        });
      }
      return { anciennedata };
    },

    onSuccess: (data) => {
      toast.success(data.message);
    },

    onError: (error, data, context) => {
      toast.error(error.message);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["evenements"] });
    },
  });
}
