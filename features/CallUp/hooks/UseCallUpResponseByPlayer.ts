import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CallUpResponseByPlayerServiceApi, CallUpResponseParams } from "../interfaces/CallUpResponseByPlayerInterface";
import toast from "react-hot-toast";
import { HTTPError } from "ky";
import { CallUpResponseByPlayerService } from "../services/CallUpResponseByPlayer.service";
import { getCallUpApiResponse } from "../interfaces/getCallUpPlayerInterface";

export function useCallUpResponseByPlayer() {
  const queryClient = useQueryClient();

  return useMutation<
    CallUpResponseByPlayerServiceApi, // ✅ Type de retour
    HTTPError, // ✅ Type d'erreur (Ky lance HTTPError, pas AxiosError)
    CallUpResponseParams, // ✅ Type des variables (callUpId + statut)
    { previousData?: getCallUpApiResponse }
  >({
    mutationFn: ({ callUpId, statut }) =>
      CallUpResponseByPlayerService.callUpResponse(callUpId, statut),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["useGetCallUp"] });

      const previousData = queryClient.getQueryData<getCallUpApiResponse>(["useGetCallUp"]);

      // ✅ Retourner le contexte pour onError/onSettled
      return { previousData };
    },

    onError: async (error, variables, context) => {
  if (context?.previousData) {
    queryClient.setQueryData(["useGetCallUp"], context.previousData);
  }

  let message = "";
  if (error instanceof HTTPError) {
    try {
      const data = await error.response.json<{ message: string }>();
      message = data.message;
    } catch {
      message = `${error.response.status}`;
    }
  }
  
  toast.error(message || "Une erreur est survenue");
},

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["useGetCallUp"] });
    },

    onSettled: () => {
      // ✅ S'exécute après onSuccess ou onError
      queryClient.invalidateQueries({ queryKey: ["useGetCallUp"] });
    },
  });
}