"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { Serialized } from "@/lib/types";
import type { getClubAdmin } from "../server/queries";

export type ClubAdmin = Serialized<Awaited<ReturnType<typeof getClubAdmin>>>;
export type ClubAdminMember = ClubAdmin["members"][number];
export type ClubAdminSection = ClubAdmin["sections"][number];

/** The club management page data (OWNER / ADMIN only). */
export function useClubAdmin() {
  return useQuery({
    queryKey: queryKeys.club.admin,
    queryFn: () => fetchJson<ClubAdmin>("/api/club"),
  });
}
