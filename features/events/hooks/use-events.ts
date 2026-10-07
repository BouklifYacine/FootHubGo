"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { EventType } from "@/generated/prisma/browser";
import { fetchJson, withQuery } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { EventListItem } from "../types";

/** ISO dates so the filters are serializable (query key + URL). */
export type EventListFilters = { from?: string; to?: string; type?: EventType };

export function useEvents(filters: EventListFilters = {}) {
  return useQuery({
    queryKey: queryKeys.events.list(filters),
    queryFn: () => fetchJson<EventListItem[]>(withQuery("/api/events", filters)),
    // Keep showing the previous range while the calendar navigates
    placeholderData: keepPreviousData,
  });
}
