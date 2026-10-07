import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { getEventStats } from "@/features/stats/server/queries";

export const GET = route<{ eventId: string }>(async ({ params }) => {
  const { membership } = await requireMember();
  return getEventStats(params.eventId, membership.teamId, membership.role === "COACH");
});
