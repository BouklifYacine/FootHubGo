import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import {
  UpdateRequestToJoinClubService,
  JoinClubResponse,
  JoinClubPayload,
  RequestToJoinClubApi,
} from "..";
import toast from "react-hot-toast";

type UpdateRequestParams = {
  requestId: string;
  teamId: string;
  data: JoinClubPayload;
};

export const useUpdateRequestToAClub = () => {
  const queryClient = useQueryClient();

  return useMutation<
    JoinClubResponse,
    HTTPError,
    UpdateRequestParams,
    { oldRequests: RequestToJoinClubApi | undefined }
  >({
    mutationFn: ({ teamId, requestId, data }) =>
      UpdateRequestToJoinClubService.patchRequest(teamId, requestId, data),

    onMutate: async ({ requestId, data }) => {
      await queryClient.cancelQueries({
        queryKey: ["playerrequesttojoinclub"],
      });

      const oldRequests = queryClient.getQueryData<RequestToJoinClubApi>([
        "playerrequesttojoinclub",
      ]);

      queryClient.setQueryData<RequestToJoinClubApi>(
        ["playerrequesttojoinclub"],
        (requests) =>
          requests?.map((request) =>
            request.id === requestId ? { ...request, ...data } : request
          )
      );

      return { oldRequests };
    },

    onSuccess: (response) => {
      toast.success(response.message);
    },

    onError: async (error, _variables, context) => {
      // Rollback on error
      if (context?.oldRequests) {
        queryClient.setQueryData(
          ["playerrequesttojoinclub"],
          context.oldRequests
        );
      }

      try {
        const errorData = (await error.response.json()) as { message: string };
        toast.error(errorData.message);
      } catch {
        toast.error("Une erreur est survenue lors de la modification.");
      }
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["playerrequesttojoinclub"],
      });
    },
  });
};
