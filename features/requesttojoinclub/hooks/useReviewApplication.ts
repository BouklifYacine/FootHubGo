import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import {
  ReviewApplicationService,
  JoinClubResponse,
  CoachApplicationsApi,
  ReviewDecision,
} from "..";
import { toast } from "sonner";
import { getHttpErrorMessage } from "@/lib/http-error";

type ReviewParams = {
  teamId: string;
  requestId: string;
  decision: ReviewDecision;
};

export const useReviewApplication = () => {
  const queryClient = useQueryClient();

  return useMutation<
    JoinClubResponse,
    HTTPError,
    ReviewParams,
    { oldApplications: CoachApplicationsApi | undefined }
  >({
    mutationFn: ({ teamId, requestId, decision }) =>
      ReviewApplicationService.review(teamId, requestId, decision),

    onMutate: async ({ teamId, requestId, decision }) => {
      await queryClient.cancelQueries({
        queryKey: ["teamApplications", teamId],
      });

      const oldApplications = queryClient.getQueryData<CoachApplicationsApi>([
        "teamApplications",
        teamId,
      ]);

      queryClient.setQueryData<CoachApplicationsApi>(
        ["teamApplications", teamId],
        (apps) =>
          apps?.map((app) =>
            app.id === requestId ? { ...app, statut: decision } : app
          )
      );

      return { oldApplications };
    },

    onSuccess: (response) => {
      toast.success(response.message);
    },

    onError: async (error, { teamId }, context) => {
      if (context?.oldApplications) {
        queryClient.setQueryData(
          ["teamApplications", teamId],
          context.oldApplications
        );
      }

      toast.error(getHttpErrorMessage(error, "Une erreur est survenue."));
    },

    onSettled: async (_data, _error, { teamId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["teamApplications", teamId],
      });
    },
  });
};
