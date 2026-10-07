import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getConversations } from "@/features/chat/server/queries";

export const GET = route(async () => {
  const user = await requireUser();
  return getConversations(user.id);
});
