import { route } from "@/lib/api/route";
import { requireSectionManager } from "@/lib/auth/session";
import { getManagedJoinRequests } from "@/features/join-requests/server/queries";

/** Requests to the sections the caller manages (coach of the section, or club OWNER / ADMIN). */
export const GET = route(async () => {
  const { membership } = await requireSectionManager();
  return getManagedJoinRequests(membership);
});
