import { SiteHeader } from "@/components/site-header";
import { requireSignedInPage } from "@/features/auth/server/page-guards";
import { SettingsView } from "@/features/settings/components/settings-view";

export default async function SettingsPage() {
  await requireSignedInPage();

  return (
    <>
      <SiteHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">Paramètres</h1>
        <SettingsView />
      </div>
    </>
  );
}
