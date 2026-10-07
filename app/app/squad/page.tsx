import { requireTeamPage } from "@/features/auth/server/page-guards";
import { SquadView } from "@/features/team/components/squad-view";

export default async function SquadPage() {
  await requireTeamPage();
  return <SquadView />;
}
