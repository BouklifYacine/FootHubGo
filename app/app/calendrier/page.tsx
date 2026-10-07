"use client";

import { EventCalendar, CalendarEvent } from "@/features/calendrier/components";
import { useCalendarEvents } from "@/features/calendrier/hooks/use-calendar-events";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { useUpdateEvent } from "@/features/calendrier/hooks/use-update-event";

export default function CalendrierPage() {
  const { data: eventsData } = useCalendarEvents();
  const { data: clubData } = useInfosClub();

  const updateEvent = useUpdateEvent();

  const role = clubData?.role;
  const canEdit = role === "ENTRAINEUR";

  const handleEventUpdate = (event: CalendarEvent) => {
    if (!event.id) return;
    updateEvent.mutate({
      id: event.id,
      data: {
        titre: event.title,
        dateDebut: event.start,
        typeEvenement: event.typeEvenement || "ENTRAINEMENT",
        lieu: event.location,
        adversaire: event.adversaire,
      },
    });
  };

  return (
    <EventCalendar
      events={eventsData || []}
      canEdit={canEdit}
      onEventUpdate={handleEventUpdate}
    />
  );
}
