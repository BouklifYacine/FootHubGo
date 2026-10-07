import { route } from "@/lib/api/route";
import { findMembership, requireUser } from "@/lib/auth/session";
import { getLeaderboard } from "@/features/stats/server/queries";

export const GET = route(async () => {
  const user = await requireUser();
  const membership = await findMembership(user.id);
  return getLeaderboard(membership?.teamId);
});
