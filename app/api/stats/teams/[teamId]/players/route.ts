import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { getTeamPlayingTime } from "@/features/stats/server/queries";

/** Season playing time of the players of the caller's active section. */
export const GET = route<{ teamId: string }>(async ({ params }) => {
  await requireMember(params.teamId);
  return getTeamPlayingTime(params.teamId);
});
