import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getLeaderboard } from "@/features/stats/server/queries";

export const GET = route(async () => {
  await requireUser();
  return getLeaderboard();
});
