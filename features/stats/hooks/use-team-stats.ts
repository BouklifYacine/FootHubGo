"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { TeamStatsSummary } from "../types";

/** Season summary of a team (the caller must be a member of it). */
export function useTeamStats(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stats.team(teamId ?? ""),
    queryFn: () => fetchJson<TeamStatsSummary>(`/api/stats/teams/${teamId}`),
    enabled: !!teamId,
  });
}
