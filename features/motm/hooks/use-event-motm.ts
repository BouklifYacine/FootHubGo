"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { EventMotm } from "../types";

/** Man-of-the-match vote of a match (null: no vote for this event). */
export function useEventMotm(eventId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.motm(eventId),
    queryFn: () => fetchJson<EventMotm | null>(`/api/events/${eventId}/motm`),
    enabled,
  });
}
