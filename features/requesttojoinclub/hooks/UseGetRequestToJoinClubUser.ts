import { useQuery } from "@tanstack/react-query";
import { GetRequestToJoinClubListService } from "..";

export function useGetRequestToJoinClub() {
  return useQuery({
    queryKey: ["playerrequesttojoinclub"],
    queryFn: () => GetRequestToJoinClubListService.ApiCall(),
  });
}
