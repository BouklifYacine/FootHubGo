import { route } from "@/lib/api/route";
import { requireMember } from "@/lib/auth/session";
import { forbidden } from "@/lib/errors";
import { canManageSection } from "@/features/clubs/rules";
import { getManagedJoinRequests } from "@/features/join-requests/server/queries";

/**
 * Requests to the sections the caller manages (coach of the section, or club OWNER / ADMIN),
 * whatever their active section.
 */
export const GET = route(async () => {
  const { membership } = await requireMember();
  if (!membership.sections.some((section) => canManageSection(membership, section.teamId))) {
    throw forbidden("Réservé aux entraîneurs et aux administrateurs du club");
  }
  return getManagedJoinRequests(membership);
});
