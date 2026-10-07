"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api/fetch-json";
import { queryKeys } from "@/lib/query/keys";
import type { NavBadge, NavContext } from "@/lib/navigation";
import { useUnreadMessagesCount } from "@/features/chat/hooks/use-conversations";
import { useMyTeam } from "@/features/team/hooks/use-my-team";

type Badges = { callUps: number; joinRequests: number };

/** Role context of the navigation + the counters of its badges. */
export function useNavigation() {
  const { data: team, isPending } = useMyTeam();
  const context: NavContext = {
    hasClub: Boolean(team?.club),
    canManage: team?.canManage ?? false,
    isClubAdmin: team?.club?.isAdmin ?? false,
  };
  const unreadMessages = useUnreadMessagesCount(context.hasClub);
  const { data: badges } = useQuery({
    queryKey: queryKeys.me.badges,
    queryFn: () => fetchJson<Badges>("/api/me/badges"),
    enabled: context.hasClub,
    refetchInterval: 5 * 60_000,
  });

  const counts: Record<NavBadge, number> = {
    messages: unreadMessages,
    callUps: badges?.callUps ?? 0,
    joinRequests: badges?.joinRequests ?? 0,
  };
  return { context, counts, team, isPending };
}

export const badgeText = (count: number) => (count > 99 ? "99+" : String(count));

/** French label read by screen readers for a badge. */
export function badgeLabel(badge: NavBadge, count: number) {
  const plural = count > 1 ? "s" : "";
  if (badge === "messages") return `${count} message${plural} non lu${plural}`;
  if (badge === "callUps") return `${count} convocation${plural} à répondre`;
  return `${count} demande${plural} d'adhésion à traiter`;
}
