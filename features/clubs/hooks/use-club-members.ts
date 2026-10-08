"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { Serialized } from "@/lib/types";
import type { getClubMembers } from "../server/queries";

export type ClubMemberItem = Serialized<Awaited<ReturnType<typeof getClubMembers>>>[number];

/** Every member of the club (all sections): chat "new conversation" and group members. */
export function useClubMembers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.club.members,
    queryFn: () => fetchJson<ClubMemberItem[]>("/api/club/members"),
    enabled,
  });
}
