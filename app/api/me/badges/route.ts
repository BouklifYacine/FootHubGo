import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getNavBadges } from "@/features/home/server/queries";

export const GET = route(async () => {
  const user = await requireUser();
  return getNavBadges(user.id);
});
