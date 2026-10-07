import { route } from "@/lib/api/route";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminUsers } from "@/features/admin/server/queries";

export const GET = route(async ({ req }) => {
  await requireAdmin();
  return getAdminUsers(Object.fromEntries(req.nextUrl.searchParams));
});
