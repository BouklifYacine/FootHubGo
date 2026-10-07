import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/app-shell";
import { requireAdminPage } from "@/features/auth/server/page-guards";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return <AppShell variant="admin">{children}</AppShell>;
}
