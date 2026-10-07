"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { Serialized } from "@/lib/types";
import type { getProfile } from "../server/queries";

export type Profile = Serialized<Awaited<ReturnType<typeof getProfile>>>;

/** Current user's profile (email, name, plan, image, subscription, auth providers). */
export function useProfile(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.me.profile,
    queryFn: () => fetchJson<Profile>("/api/me/profile"),
    enabled: options.enabled,
  });
}
