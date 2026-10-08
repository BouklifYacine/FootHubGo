import type { Metadata } from "next";
import { requireTeamPage } from "@/features/auth/server/page-guards";
import { PollsOverview } from "@/features/polls/components/polls-overview";

export const metadata: Metadata = { title: "Sondages" };

export default async function PollsPage() {
  await requireTeamPage();
  return <PollsOverview />;
}
