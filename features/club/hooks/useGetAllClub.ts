import { useQuery } from "@tanstack/react-query";
import { ClubService, ClubStats } from "../services/club.service";

export function useGetAllClub() {
  return useQuery<ClubStats[]>({
    queryKey: ["clubs-stats"],
    queryFn: ClubService.getClubStats,
  });
}
