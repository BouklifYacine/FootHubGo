import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { getEventCallUps } from "@/features/call-ups/server/queries";

export const GET = route<{ eventId: string }>(async ({ params }) => {
  const { membership } = await requireMember();
  return getEventCallUps(params.eventId, membership.teamId, membership.role === "COACH");
});
