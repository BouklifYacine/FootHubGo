import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { creerEquipe } from "../actions/creerequipeaction";
import { CreationEquipeInputs } from "../schemas/SchemaEquipe";

export function useCreerEquipe() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreationEquipeInputs) => {
      return await creerEquipe(data);
    },

    onMutate: () => {
      toast.loading("Création de l'équipe en cours...");
    },

    onSuccess: (result) => {
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ["equipes"] });
        if (result.equipe && result.equipe.id) {
          router.push(`/dashboardclient/equipe/${result.equipe.id}`);
        } else {
          router.push("/dashboardclient");
        }
      } else {
        toast.error(result.message || "Échec de la création de l'équipe");
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la création de l'équipe"
      );
    },
  });
}