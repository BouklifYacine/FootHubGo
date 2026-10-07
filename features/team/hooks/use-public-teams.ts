"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { Serialized } from "@/lib/types";
import type { getPublicClubs } from "@/features/clubs/server/queries";

export type PublicClub = Serialized<Awaited<ReturnType<typeof getPublicClubs>>>[number];

/** Directory of the clubs (with their sections) a player can discover (private clubs excluded). */
export function usePublicClubs() {
  return useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: () => fetchJson<PublicClub[]>("/api/teams"),
  });
}
