"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { Standing } from "../types";

/** League table of every team, best first. */
export function useLeaderboard() {
  return useQuery({
    queryKey: queryKeys.stats.teams,
    queryFn: () => fetchJson<Standing[]>("/api/stats/teams"),
  });
}
