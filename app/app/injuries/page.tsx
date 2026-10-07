import { requireTeamPage } from "@/features/auth/server/page-guards";
import { InjuriesOverview } from "@/features/injuries/components/injuries-overview";

export default async function InjuriesPage() {
  await requireTeamPage();
  return <InjuriesOverview />;
}
