"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { TeamPlayingTime } from "../types";

/** Season playing time of the section's players, most minutes first. */
export function useTeamPlayingTime(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stats.teamPlayers(teamId ?? ""),
    queryFn: () => fetchJson<TeamPlayingTime>(`/api/stats/teams/${teamId}/players`),
    enabled: !!teamId,
  });
}
