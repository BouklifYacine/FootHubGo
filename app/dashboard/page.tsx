import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import { requireAdminPage } from "@/features/auth/server/page-guards";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminPage() {
  await requireAdminPage();
  return <AdminDashboard />;
}
