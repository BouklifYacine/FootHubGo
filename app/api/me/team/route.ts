import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getMyTeam } from "@/features/team/server/queries";

export const GET = route(async () => {
  const user = await requireUser();
  return getMyTeam(user.id);
});
