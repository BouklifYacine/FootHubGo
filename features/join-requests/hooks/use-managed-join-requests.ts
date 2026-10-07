"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { TeamJoinRequest } from "../types";

/** Requests received by the sections the caller manages. */
export function useManagedJoinRequests() {
  return useQuery({
    queryKey: queryKeys.club.joinRequests,
    queryFn: () => fetchJson<TeamJoinRequest[]>("/api/club/join-requests"),
  });
}
