"use client";

import { useActionMutation } from "@/lib/query/use-action-mutation";
import { useRefreshAll } from "@/features/clubs/hooks/use-refresh-all";
import { joinTeamWithCode } from "../actions";

/**
 * Joins a section with its invite code (made active), then lands on the home, where the next steps
 * are (next event, call-ups to answer, the tour).
 */
export function useJoinWithCode(onJoined?: () => void) {
  const refreshAll = useRefreshAll();
  return useActionMutation(joinTeamWithCode, {
    onSuccess: () => {
      onJoined?.();
      refreshAll("/app");
    },
  });
}
