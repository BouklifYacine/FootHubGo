"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SupprimerClubAction } from "../actions/Supprimerclub";
import { useRouter } from "next/navigation";

export function useSupprimerClub() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (equipeId: string) => {
      const result = await SupprimerClubAction(equipeId);
      if (!result.success) throw new Error(result.message);
      return result;
    },

    onSuccess: (data) => {
      router.push("/app");
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(
        error.message || "Échec de la suppression du code d'invitation"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["infosclub"] });
    },
  });
}
