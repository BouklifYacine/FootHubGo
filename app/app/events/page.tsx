import { redirect } from "next/navigation";
import { findMembership, getSession } from "@/lib/auth/session";
import { EventList } from "@/features/events/components/event-list";

export default async function EventsPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!(await findMembership(session.user.id))) redirect("/app");

  return <EventList />;
}
