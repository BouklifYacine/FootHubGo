"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { EventStats } from "../types";


/** Everything a stats mutation can change: stats pages, event pages and the home page. */
export const statsInvalidation = [queryKeys.stats.all, queryKeys.events.all, queryKeys.home];

/** Team + player stats of one event (and, for the coach, the players still without stats). */
export function useEventStats(eventId: string) {
  return useQuery({
    queryKey: queryKeys.stats.event(eventId),
    queryFn: () => fetchJson<EventStats>(`/api/stats/events/${eventId}`),
  });
}
