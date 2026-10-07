import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getMyJoinRequests } from "@/features/join-requests/server/queries";

export const GET = route(async () => {
  const user = await requireUser();
  return getMyJoinRequests(user.id);
});
