import { requireTeamPage } from "@/features/auth/server/page-guards";
import { StatsOverview } from "@/features/stats/components/stats-overview";

export default async function StatsPage() {
  await requireTeamPage();
  return <StatsOverview />;
}
