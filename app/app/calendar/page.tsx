import { redirect } from "next/navigation";
import { findMembership, getSession } from "@/lib/auth/session";
import { EventCalendar } from "@/features/calendar/components/event-calendar";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const membership = await findMembership(session.user.id);
  if (!membership) redirect("/app");

  return <EventCalendar canEdit={membership.role === "COACH"} />;
}
