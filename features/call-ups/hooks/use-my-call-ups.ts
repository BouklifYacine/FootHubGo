"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { MyCallUps } from "../types";

export function useMyCallUps() {
  return useQuery({
    queryKey: queryKeys.me.callUps,
    queryFn: () => fetchJson<MyCallUps>("/api/me/call-ups"),
  });
}
