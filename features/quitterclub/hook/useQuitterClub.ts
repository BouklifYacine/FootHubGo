import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { quitterClubAction } from "../actions/quitterclubaction";
import { useRouter } from "next/navigation";

export function useQuitterClub() {
  const queryClient = useQueryClient();
    const router = useRouter();

  return useMutation({
    mutationFn: quitterClubAction,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["infosclub"] });
      const previousData = queryClient.getQueryData(["infosclub"]);
      return { previousData };
    },
    onSuccess: (data) => {
      if (data.success) {
        router.push("/dashboardfoothub")
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error, _, context) => {
      toast.error("Erreur lors de la sortie du club");
      if (context?.previousData) {
        queryClient.setQueryData(["infosclub"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["infosclub"] });
    },
  });
}