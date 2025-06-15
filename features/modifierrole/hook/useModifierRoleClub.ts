import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ModifierRoleAction } from "../actions/ModifierRoleAction";
import { InfosClubApiResponse } from "@/features/club/hooks/useinfosclub";
import toast from "react-hot-toast";

export type RoleType = "ENTRAINEUR" | "JOUEUR";

interface ModifierRoleparam {
  id: string;
  data: {
    role: RoleType;
  };
}

export function useModifierRoleClub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: ModifierRoleparam) => {
      const resultat = await ModifierRoleAction(id, data);
      if (!resultat.success) throw new Error(resultat.message);
      return resultat;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["infosclub"] });
      const previousData = queryClient.getQueryData<InfosClubApiResponse>([
        "infosclub",
      ]);

      if (previousData) {
        queryClient.setQueryData(["infosclub"], {
          ...previousData,
          membres: previousData.membres.map((m) =>
            m.userId === id ? { ...m, role: data.role } : m
          ),
        });
        return { previousData };
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["infosclub"], context.previousData);
      }
      toast.error(error.message || "Échec de la modification du rôle");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["infosclub"] });
    },
  });
}
