import { route } from "@/lib/api/route";
import { requireClubPermission } from "@/lib/auth/session";
import { getClubAdmin } from "@/features/clubs/server/queries";

export const GET = route(async () => {
  const { membership } = await requireClubPermission("updateClub");
  return getClubAdmin(membership);
});
