import { route } from "@/lib/api/route";
import { requireUser } from "@/lib/auth/session";
import { getPublicClubs } from "@/features/clubs/server/queries";

/** Club directory (clubs with their sections). */
export const GET = route(async () => {
  await requireUser();
  return getPublicClubs();
});
