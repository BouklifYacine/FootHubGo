import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { getTeamStatsSummary } from "@/features/stats/server/queries";

export const GET = route<{ teamId: string }>(async ({ params }) => {
  await requireMember(params.teamId);
  return getTeamStatsSummary(params.teamId);
});
