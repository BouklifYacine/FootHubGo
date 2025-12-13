import { useQuery } from "@tanstack/react-query";
import { MemberService } from "../services";
import type { ClubMembersResponse } from "../types";

export function useClubMembers() {
  return useQuery<ClubMembersResponse>({
    queryKey: ["club-members"],
    queryFn: MemberService.getClubMembers,
  });
}
