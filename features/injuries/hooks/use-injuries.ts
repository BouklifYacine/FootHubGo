"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { PlayerInjury, TeamInjuryRow } from "../types";

/** Everything an injury mutation can change (injury lists + "injured" flags on the squad). */
export const injuryInvalidation = [queryKeys.injuries.all, queryKeys.me.team, queryKeys.home];

export function usePlayerInjuries(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.injuries.player(userId ?? ""),
    queryFn: () => fetchJson<PlayerInjury[]>(`/api/injuries/players/${userId}`),
    enabled: !!userId,
  });
}

/** Coach only. */
export function useTeamInjuries(teamId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.injuries.team(teamId ?? ""),
    queryFn: () => fetchJson<TeamInjuryRow[]>("/api/injuries/team"),
    enabled: !!teamId,
  });
}
