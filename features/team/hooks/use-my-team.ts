"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { Serialized } from "@/lib/types";
import type { getMyTeam } from "../server/queries";

export type MyTeam = Serialized<Awaited<ReturnType<typeof getMyTeam>>>;
export type MyTeamMember = MyTeam["members"][number];

/** Current user's team, members and role ("COACH" | "PLAYER" | "NO_CLUB"). */
export function useMyTeam() {
  return useQuery({
    queryKey: queryKeys.me.team,
    queryFn: () => fetchJson<MyTeam>("/api/me/team"),
  });
}
