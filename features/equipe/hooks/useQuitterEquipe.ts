import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { quitterEquipe } from "../actions/quitterequipeaction";

export function useQuitterEquipe() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({equipeId,membreId}: {equipeId:string; membreId?:string;
    }) => {return await quitterEquipe(equipeId, membreId);},

    onMutate: (variables) => {
      toast.loading(
        variables.membreId
          ? "Suppression du membre en cours..."
          : "Suppression en cours"
      );
    },

    onSuccess: (result, variables) => {
      toast.dismiss();

      if (result.success) {
        toast.success(result.message);

        queryClient.invalidateQueries({
          queryKey: ["membre-equipe", variables.equipeId],
        });
        queryClient.invalidateQueries({
          queryKey: ["equipes"],
        });
        queryClient.invalidateQueries({
          queryKey: ["profile"],
        });

        if (!variables.membreId) {
          router.push("/dashboardclient");
        }
      } else {
        toast.error(result.message);
      }
    },

    onError: (error: Error) => {
      toast.dismiss();
      toast.error(error.message || "Erreur lors de la suppression du membre");
    },
  });
}