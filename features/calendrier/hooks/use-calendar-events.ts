import dayjs from "dayjs";
import { CalendarEventResponse } from "../types/api-types";
import { CalendarEvent } from "@/components";
import { CalendarService } from "../services/calendar.service";
import { useQuery } from "@tanstack/react-query";

const eventColorMap = {
  COUPE: "emerald",
  CHAMPIONNAT: "sky",
  ENTRAINEMENT: "orange",
} as const;

export const useCalendarEvents = () => {
  return useQuery<CalendarEventResponse[], Error, CalendarEvent[]>({
    queryKey: ["calendar-events"],
    queryFn: CalendarService.getAllEvents,
    select: (data: CalendarEventResponse[]) =>
      data.map((e: CalendarEventResponse) => ({
        id: e.id,
        title: e.titre,
        description: e.description,
        location: e.lieu,
        start: new Date(e.dateDebut),
        end: dayjs(e.dateDebut).add(2, "hour").toDate(),
        color: eventColorMap[e.typeEvenement as keyof typeof eventColorMap],
        allDay: false,
        typeEvenement: e.typeEvenement as
          | "ENTRAINEMENT"
          | "CHAMPIONNAT"
          | "COUPE",
        adversaire: e.adversaire,
      })),
  });
};
