import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { getEvent } from "@/features/events/server/queries";

export const GET = route<{ eventId: string }>(async ({ params }) => {
  const { membership } = await requireMember();
  return getEvent(params.eventId, membership.teamId);
});
