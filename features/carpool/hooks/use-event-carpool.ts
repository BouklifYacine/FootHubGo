"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { EventCarpool } from "../types";

/** Everything a carpool write can change: the event (agenda, page, carpool block) and the home. */
export const carpoolInvalidation = [queryKeys.events.all, queryKeys.home];

/** Rides of an away match (null: no carpool for this event). */
export function useEventCarpool(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.carpool(eventId),
    queryFn: () => fetchJson<EventCarpool | null>(`/api/events/${eventId}/carpool`),
  });
}
