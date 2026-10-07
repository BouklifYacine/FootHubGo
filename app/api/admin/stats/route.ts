import { route } from "@/lib/api/route";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminStats } from "@/features/admin/server/queries";

export const GET = route(async () => {
  await requireAdmin();
  return getAdminStats();
});
