import { route } from "@/lib/api/route";
import { requireCoach } from "@/lib/auth/session";
import { getTeamJoinRequests } from "@/features/join-requests/server/queries";

export const GET = route<{ teamId: string }>(async ({ params }) => {
  const { membership } = await requireCoach(params.teamId);
  return getTeamJoinRequests(membership.teamId);
});
