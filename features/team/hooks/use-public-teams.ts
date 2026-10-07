"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { Serialized } from "@/lib/types";
import type { getPublicTeams } from "../server/queries";

export type PublicTeam = Serialized<Awaited<ReturnType<typeof getPublicTeams>>>[number];

/** Directory of the teams a player can discover (private teams excluded). */
export function usePublicTeams() {
  return useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: () => fetchJson<PublicTeam[]>("/api/teams"),
  });
}
