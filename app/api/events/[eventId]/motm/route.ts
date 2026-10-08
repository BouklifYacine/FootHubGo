import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { getEventMotm } from "@/features/motm/server/queries";

/** Man of the match of a match of the active section (null when the event has no vote). */
export const GET = route<{ eventId: string }>(async ({ params }) => {
  const { user, membership } = await requireMember();
  return getEventMotm(params.eventId, membership.teamId, { userId: user.id, role: membership.role });
});
