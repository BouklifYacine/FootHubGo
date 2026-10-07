"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { HomeData } from "../types";

/** Home dashboard data, or null when the user has no team. */
export function useHome() {
  return useQuery({
    queryKey: queryKeys.home,
    queryFn: () => fetchJson<HomeData | null>("/api/home"),
  });
}
