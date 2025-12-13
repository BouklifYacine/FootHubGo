"use client";

import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fr"; // Import locale
import { EventCalendar, CalendarEvent } from "@/features/calendrier/components";
import { useCalendarEvents } from "@/features/calendrier/hooks/use-calendar-events";
import { useInfosClub } from "@/features/club/hooks/useinfosclub";
import { useCreateEvent } from "@/features/calendrier/hooks/use-create-event";
import { useUpdateEvent } from "@/features/calendrier/hooks/use-update-event";
import { useDeleteEvent } from "@/features/calendrier/hooks/use-delete-event";

// Set global locale
dayjs.locale("fr");

export default function page() {
  const { data: eventsData, isPending: isEventsPending } = useCalendarEvents();
  const { data: clubData, isPending: isClubPending } = useInfosClub();

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const role = clubData?.role;
  const canEdit = role === "ENTRAINEUR";

  const handleEventAdd = (event: CalendarEvent) => {
    // Map CalendarEvent to EventInput
    createEvent.mutate({
      titre: event.title || "Nouvel événement",
      dateDebut: event.start,
      typeEvenement: event.typeEvenement || "ENTRAINEMENT",
      lieu: event.location,
      adversaire: event.adversaire,
    });
  };

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

  const handleEventDelete = (eventId: string) => {
    deleteEvent.mutate(eventId);
  };

  return (
    <EventCalendar
      events={eventsData || []}
      canEdit={canEdit}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
    />
  );
}
