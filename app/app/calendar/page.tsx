import { requireTeamPage } from "@/features/auth/server/page-guards";
import { EventCalendar } from "@/features/calendar/components/event-calendar";

export default async function CalendarPage() {
  const { membership } = await requireTeamPage();
  return <EventCalendar canEdit={membership.role === "COACH"} />;
}
