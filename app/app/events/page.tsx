import { requireTeamPage } from "@/features/auth/server/page-guards";
import { EventList } from "@/features/events/components/event-list";

export default async function EventsPage() {
  await requireTeamPage();
  return <EventList />;
}
