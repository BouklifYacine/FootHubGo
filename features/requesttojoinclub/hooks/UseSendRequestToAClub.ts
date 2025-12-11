import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { JoinClubPayload, JoinClubResponse, JoinClubService } from "..";
import toast from "react-hot-toast";

export const useJoinClub = () => {
  const queryClient = useQueryClient();

  return useMutation<
    JoinClubResponse,
    HTTPError,
    { teamId: string; data: JoinClubPayload }
  >({
    mutationFn: ({ teamId, data }) => JoinClubService.sendRequest(teamId, data),

    onSuccess: (response) => {
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
      await queryClient.invalidateQueries({queryKey: ["playerrequesttojoinclub"],
      });
    },
  });
};
