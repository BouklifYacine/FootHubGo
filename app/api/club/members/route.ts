import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { getClubMembers } from "@/features/clubs/server/queries";

export const GET = route(async () => {
  const { membership } = await requireMember();
  return getClubMembers(membership.clubId);
});
