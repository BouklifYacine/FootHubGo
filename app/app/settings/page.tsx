import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/app/page-header";
import { SettingsView } from "@/features/settings/components/settings-view";

export const metadata: Metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return (
    <Page className="max-w-3xl">
      <PageHeader title="Paramètres" description="Ton profil, ton compte et tes notifications." />
      <SettingsView />
    </Page>
  );
}
