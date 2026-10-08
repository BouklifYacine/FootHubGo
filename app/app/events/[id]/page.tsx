import type { Metadata } from "next";
import { requireTeamPage } from "@/features/auth/server/page-guards";
import { EventDetail } from "@/features/events/components/event-detail";

export const metadata: Metadata = { title: "Événement" };

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireTeamPage();
  const { id } = await params;
  return <EventDetail eventId={id} />;
}
