import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { listMyAttendances } from "@/features/events/server/queries";

export const GET = route(async () => {
  const { user, membership } = await requireMember();
  return listMyAttendances(user.id, membership.teamId);
});
