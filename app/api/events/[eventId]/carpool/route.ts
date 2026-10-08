import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { getEventCarpool } from "@/features/carpool/server/queries";

/** Rides of an away match of the active section (null when the event has no carpool). */
export const GET = route<{ eventId: string }>(async ({ params }) => {
  const { user, membership } = await requireMember();
  return getEventCarpool(params.eventId, membership, user.id);
});
