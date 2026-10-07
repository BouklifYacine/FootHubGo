import { redirect } from "next/navigation";
import { findMembership, getSession } from "@/lib/auth/session";
import { EventDetail } from "@/features/events/components/event-detail";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  if (!(await findMembership(session.user.id))) redirect("/app");

  const { id } = await params;
  return <EventDetail eventId={id} />;
}
