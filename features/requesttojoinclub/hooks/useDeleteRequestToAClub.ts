import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import {
  DeleteRequestToJoinClubService,
  JoinClubResponse,
  RequestBase,
} from "..";
import toast from "react-hot-toast";

export const useDeleteRequestToAClub = () => {
  const queryClient = useQueryClient();

  return useMutation<
    JoinClubResponse,
    HTTPError,
    { requestId: string; teamId: string }
  >({
    mutationFn: ({ teamId, requestId }) =>
      DeleteRequestToJoinClubService.deleteRequest(teamId, requestId),

    onMutate: async (requestId) => {
      await queryClient.cancelQueries({
        queryKey: ["playerrequesttojoinclub"],
      });
      const oldTransfertRequest = queryClient.getQueryData([
        "playerrequesttojoinclub",
      ]);

      queryClient.setQueryData(
        ["playerrequesttojoinclub"],
        (TransfertRequest: RequestBase[]) =>
          TransfertRequest.filter(
            (request) => request.id !== requestId.requestId
          )
      );

      return { oldTransfertRequest };
    },

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["playerrequesttojoinclub"] });
      toast.success(response.message);
    },

    onError: async (error) => {
      try {
        const errorData = (await error.response.json()) as { message: string };
        toast.error(errorData.message);
      } catch {
        toast.error("Une erreur est survenue lors de la demande.");
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["playerrequesttojoinclub"],
      });
    },
  });
};
