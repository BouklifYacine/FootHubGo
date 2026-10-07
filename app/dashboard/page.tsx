import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { requireAdminPage } from "@/features/auth/server/page-guards";

export default async function AdminPage() {
  await requireAdminPage();
  return <AdminDashboard />;
}
