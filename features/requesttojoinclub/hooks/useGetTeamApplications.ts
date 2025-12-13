import { useQuery } from "@tanstack/react-query";
import { GetTeamApplicationsService } from "..";

export function useGetTeamApplications(teamId: string | undefined) {
  return useQuery({
    queryKey: ["teamApplications", teamId],
    queryFn: () => GetTeamApplicationsService.getApplications(teamId!),
    enabled: !!teamId,
  });
}
