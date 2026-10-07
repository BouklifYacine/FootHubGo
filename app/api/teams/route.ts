import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getPublicTeams } from "@/features/team/server/queries";

export const GET = route(async () => {
  await requireUser();
  return getPublicTeams();
});
