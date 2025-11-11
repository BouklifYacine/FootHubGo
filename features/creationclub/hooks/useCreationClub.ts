import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreationClubAction } from "../actions/CreationClubAction";
import toast from "react-hot-toast";
import { SchemaCreationClub } from "../schemas/SchemaCreationClub";
import z from "zod";

type schema = z.infer<typeof SchemaCreationClub>;
type CreationClubResult = {
  success: boolean;
  message: string;
};

export function useCreationClub() {
  const queryClient = useQueryClient();

  return useMutation<CreationClubResult, Error, schema>({
    mutationFn: async (data) => {
      const result = await CreationClubAction(data);
      // Si jamais CreationClubAction peut throw, tu peux throw ici pour onError
      if (!result) throw new Error("Erreur inconnue");
      return result;
    },

    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du club");
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(data.message || "Club créé avec succès");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clubs"] });
      queryClient.invalidateQueries({ queryKey: ["infosclub"] });
    },
  });
}
