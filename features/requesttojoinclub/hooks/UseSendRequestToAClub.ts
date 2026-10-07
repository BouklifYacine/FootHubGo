import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { JoinClubPayload, JoinClubResponse, JoinClubService } from "..";
import { toast } from "sonner";
import { getHttpErrorMessage } from "@/lib/http-error";

export const UseSendRequestToAClub = () => {
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
      toast.error(getHttpErrorMessage(error, "Une erreur est survenue lors de la demande."));
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({queryKey: ["playerrequesttojoinclub"],
      });
    },
  });
};
