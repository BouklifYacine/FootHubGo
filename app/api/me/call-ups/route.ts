import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { listMyCallUps } from "@/features/call-ups/server/queries";

export const GET = route(async () => {
  const user = await requireUser();
  return listMyCallUps(user.id);
});
