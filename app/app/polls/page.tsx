import { requireTeamPage } from "@/features/auth/server/page-guards";
import { PollsOverview } from "@/features/polls/components/polls-overview";

export default async function PollsPage() {
  await requireTeamPage();
  return <PollsOverview />;
}
