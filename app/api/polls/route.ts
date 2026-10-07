import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { listPolls } from "@/features/polls/server/queries";

export const GET = route(async () => {
  const { user, membership } = await requireMember();
  return listPolls(membership.teamId, user.id);
});
