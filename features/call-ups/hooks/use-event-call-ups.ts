"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { EventCallUps } from "../types";

export function useEventCallUps(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.callUps(eventId),
    queryFn: () => fetchJson<EventCallUps>(`/api/events/${eventId}/call-ups`),
  });
}
