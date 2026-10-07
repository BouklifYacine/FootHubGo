import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/features/settings/server/queries";

export const GET = route(async () => {
  const user = await requireUser();
  return getProfile(user.id);
});
