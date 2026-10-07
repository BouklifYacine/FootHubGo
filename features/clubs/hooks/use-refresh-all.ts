"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/**
 * After the active section (or the club) changes, every cached query belongs to the old one:
 * refetch them all and re-render the server components, optionally after moving to `to`.
 */
export function useRefreshAll() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return (to?: string) => {
    if (to) router.push(to);
    router.refresh();
    void queryClient.invalidateQueries();
  };
}
