"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { PlayerStatsSummary } from "../types";

/** Season summary of the current user as a player. */
export function usePlayerStats(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.stats.players,
    queryFn: () => fetchJson<PlayerStatsSummary>("/api/stats/players"),
    enabled: options.enabled,
  });
}
