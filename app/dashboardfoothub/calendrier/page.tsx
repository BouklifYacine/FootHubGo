"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { EventCalendar, CalendarEvent } from "@/features/calendrier/components";

const sampleEvents: CalendarEvent[] = [
  {
    allDay: true,
    color: "sky",
    description: "Strategic planning for next year",
    end: dayjs().subtract(23, "days").toDate(), // 23 days before today
    id: "1",
    location: "Main Conference Hall",
    start: dayjs().subtract(24, "days").toDate(), // 24 days before today
    title: "Annual Planning",
  },
  {
    color: "amber",
    description: "Submit final deliverables",
    end: dayjs().subtract(9, "days").hour(15).minute(30).toDate(), // 3:30 PM, 9 days before
    id: "2",
    location: "Office",
    start: dayjs().subtract(9, "days").hour(13).minute(0).toDate(), // 1:00 PM, 9 days before
    title: "Project Deadline",
  },
  {
    allDay: true,
    color: "orange",
    description: "Strategic planning for next year",
    end: dayjs().subtract(13, "days").toDate(), // 13 days before today
    id: "3",
    location: "Main Conference Hall",
    start: dayjs().subtract(13, "days").toDate(), // 13 days before today
    title: "Quarterly Budget Review",
  },
  {
    color: "sky",
    description: "Weekly team sync",
    end: dayjs().hour(11).minute(0).toDate(), // 11:00 AM today
    id: "4",
    location: "Conference Room A",
    start: dayjs().hour(10).minute(0).toDate(), // 10:00 AM today
    title: "Team Meeting",
  },
  {
    color: "emerald",
    description: "Discuss new project requirements",
    end: dayjs().add(1, "day").hour(13).minute(15).toDate(), // 1:15 PM, 1 day from now
    id: "5",
    location: "Downtown Cafe",
    start: dayjs().add(1, "day").hour(12).minute(0).toDate(), // 12:00 PM, 1 day from now
    title: "Lunch with Client",
  },
  {
    allDay: true,
    color: "violet",
    description: "New product release",
    end: dayjs().add(6, "days").toDate(), // 6 days from now
    id: "6",
    start: dayjs().add(3, "days").toDate(), // 3 days from now
    title: "Product Launch",
  },
  {
    color: "rose",
    description: "Discuss about new clients",
    end: dayjs().add(5, "days").hour(14).minute(45).toDate(), // 2:45 PM, 5 days from now
    id: "7",
    location: "Downtown Cafe",
    start: dayjs().add(4, "days").hour(14).minute(30).toDate(), // 2:30 PM, 4 days from now
    title: "Sales Conference",
  },
  {
    color: "orange",
    description: "Weekly team sync",
    end: dayjs().add(5, "days").hour(10).minute(30).toDate(), // 10:30 AM, 5 days from now
    id: "8",
    location: "Conference Room A",
    start: dayjs().add(5, "days").hour(9).minute(0).toDate(), // 9:00 AM, 5 days from now
    title: "Team Meeting",
  },
  {
    color: "sky",
    description: "Weekly team sync",
    end: dayjs().add(5, "days").hour(15).minute(30).toDate(), // 3:30 PM, 5 days from now
    id: "9",
    location: "Conference Room A",
    start: dayjs().add(5, "days").hour(14).minute(0).toDate(), // 2:00 PM, 5 days from now
    title: "Review contracts",
  },
  {
    color: "amber",
    description: "Weekly team sync",
    end: dayjs().add(5, "days").hour(11).minute(0).toDate(), // 11:00 AM, 5 days from now
    id: "10",
    location: "Conference Room A",
    start: dayjs().add(5, "days").hour(9).minute(45).toDate(), // 9:45 AM, 5 days from now
    title: "Team Meeting",
  },
  {
    color: "emerald",
    description: "Quarterly marketing planning",
    end: dayjs().add(9, "days").hour(15).minute(30).toDate(), // 3:30 PM, 9 days from now
    id: "11",
    location: "Marketing Department",
    start: dayjs().add(9, "days").hour(10).minute(0).toDate(), // 10:00 AM, 9 days from now
    title: "Marketing Strategy Session",
  },
  {
    allDay: true,
    color: "sky",
    description: "Presentation of yearly results",
    end: dayjs().add(17, "days").toDate(), // 17 days from now
    id: "12",
    location: "Grand Conference Center",
    start: dayjs().add(17, "days").toDate(), // 17 days from now
    title: "Annual Shareholders Meeting",
  },
  {
    color: "rose",
    description: "Brainstorming for new features",
    end: dayjs().add(27, "days").hour(17).minute(0).toDate(), // 5:00 PM, 27 days from now
    id: "13",
    location: "Innovation Lab",
    start: dayjs().add(26, "days").hour(9).minute(0).toDate(), // 9:00 AM, 26 days from now
    title: "Product Development Workshop",
  },
];

export default function page() {
  const [events, setEvents] = useState<CalendarEvent[]>(sampleEvents);

  // const handleEventAdd = (event: CalendarEvent) => {
  //   setEvents([...events, event]);
  // };

  // const handleEventUpdate = (updatedEvent: CalendarEvent) => {
  //   setEvents(
  //     events.map((event) =>
  //       event.id === updatedEvent.id ? updatedEvent : event
  //     )
  //   );
  // };

  // const handleEventDelete = (eventId: string) => {
  //   setEvents(events.filter((event) => event.id !== eventId));
  // };

  return <EventCalendar events={events} />;
}
