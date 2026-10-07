import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/app-shell";
import { requireSignedInPage } from "@/features/auth/server/page-guards";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireSignedInPage();
  return <AppShell variant="app">{children}</AppShell>;
}
