"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { MyJoinRequest } from "../types";

export function useMyJoinRequests() {
  return useQuery({
    queryKey: queryKeys.me.joinRequests,
    queryFn: () => fetchJson<MyJoinRequest[]>("/api/me/join-requests"),
  });
}
