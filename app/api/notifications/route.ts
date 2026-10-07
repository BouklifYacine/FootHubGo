import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getNotifications } from "@/features/notifications/server/queries";

export const GET = route(async () => {
  const user = await requireUser();
  return getNotifications(user.id);
});
