"use client";

import FullCalendar, { type EventInput, useCalendarController } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import frLocale from "@fullcalendar/react/locales/fr";
import breezyTheme from "@fullcalendar/react/themes/breezy";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/breezy/theme.css";
import "../calendar.css";
import { setHours } from "date-fns";
import { useMemo, useState } from "react";
import type { EventType } from "@/generated/prisma/browser";
import { EVENT_TYPES } from "@/features/events/event-types";
import { useMoveEvent } from "@/features/events/hooks/use-event-actions";
import { useEvents } from "@/features/events/hooks/use-events";
import { CalendarToolbar } from "./calendar-toolbar";
import { EventDialog, type EventDialogState } from "./event-dialog";
import type { ScopeOption } from "./event-form";

const plugins = [breezyTheme, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin];

/**
 * Section calendar (its events + the club-wide ones). Coaches create (click a day / slot), edit and
 * drag their section's events; club OWNER / ADMIN also manage club-wide events; players only read.
 */
export function EventCalendar({ canEdit, scopeOptions }: { canEdit: boolean; scopeOptions?: ScopeOption[] }) {
  const controller = useCalendarController();
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [types, setTypes] = useState<EventType[]>([]);
  const [dialog, setDialog] = useState<EventDialogState>(null);
  const { data: events = [] } = useEvents(range);
  const moveEvent = useMoveEvent();

  const calendarEvents = useMemo<EventInput[]>(
    () =>
      events
        .filter((event) => types.length === 0 || types.includes(event.type))
        .map((event) => ({
          id: event.id,
          title: `${event.isClubEvent ? "[Club] " : ""}${event.opponent ? `${event.title} - ${event.opponent}` : event.title}`,
          start: event.startDate,
          color: EVENT_TYPES[event.type].color,
          // Events with match stats are locked (also enforced by the server actions)
          startEditable: event.canEdit && !event.hasStats,
        })),
    [events, types],
  );

  const openEvent = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) setDialog({ mode: "view", event });
  };

  return (
    <div className="event-calendar rounded-lg border">
      <CalendarToolbar
        controller={controller}
        types={types}
        onTypesChange={setTypes}
        onCreate={canEdit ? () => setDialog({ mode: "create", start: setHours(new Date(), 18) }) : undefined}
      />
      <FullCalendar
        controller={controller}
        plugins={plugins}
        locale={frLocale}
        initialView="dayGridMonth"
        headerToolbar={false}
        height="auto"
        events={calendarEvents}
        datesSet={(info) => setRange({ from: info.start.toISOString(), to: info.end.toISOString() })}
        defaultTimedEventDuration="02:00"
        allDaySlot={false}
        scrollTime="08:00"
        nowIndicator
        dayMaxEvents
        editable={canEdit}
        eventDurationEditable={false}
        eventClick={(info) => openEvent(info.event.id)}
        dateClick={(info) => {
          if (!canEdit) return;
          // A click on a whole day (month view) proposes 18:00
          setDialog({ mode: "create", start: info.allDay ? setHours(info.date, 18) : info.date });
        }}
        eventDrop={(info) => {
          if (!info.event.start) return info.revert();
          moveEvent.mutate({ eventId: info.event.id, startDate: info.event.start }, { onError: () => info.revert() });
        }}
      />
      <EventDialog state={dialog} scopeOptions={scopeOptions} onClose={() => setDialog(null)} />
    </div>
  );
}
