import { useQuery } from "@tanstack/react-query";
import { ChatService } from "../services/ChatService";
import { ClubMembersResponse } from "../types/chat.types";

export function useClubMembers() {
  return useQuery<ClubMembersResponse>({
    queryKey: ["club-members"],
    queryFn: ChatService.getClubMembers,
  });
}
