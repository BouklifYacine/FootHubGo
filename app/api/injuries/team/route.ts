import { route } from "@/lib/api/route";
import { requireCoach } from "@/lib/auth/session";
import { getTeamInjuries } from "@/features/injuries/server/queries";

/** Injury status of the coach's squad. */
export const GET = route(async () => {
  const { membership } = await requireCoach();
  return getTeamInjuries(membership.teamId);
});
