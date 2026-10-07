import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getMessagesPage } from "@/features/chat/server/queries";

/** GET /api/chat/conversations/:id/messages?cursor=<oldest loaded message id> */
export const GET = route<{ conversationId: string }>(async ({ req, params }) => {
  const user = await requireUser();
  const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
  return getMessagesPage(user.id, params.conversationId, cursor);
});
