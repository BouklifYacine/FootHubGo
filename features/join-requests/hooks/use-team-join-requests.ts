"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { TeamJoinRequest } from "../types";

/** Requests received by the coach's team. */
export function useTeamJoinRequests(teamId: string) {
  return useQuery({
    queryKey: queryKeys.teams.joinRequests(teamId),
    queryFn: () => fetchJson<TeamJoinRequest[]>(`/api/teams/${teamId}/join-requests`),
  });
}
