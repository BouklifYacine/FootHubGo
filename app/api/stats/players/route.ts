import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getPlayerStatsSummary } from "@/features/stats/server/queries";

/** The current user's own player stats. */
export const GET = route(async () => {
  const user = await requireUser();
  return getPlayerStatsSummary(user.id);
});
