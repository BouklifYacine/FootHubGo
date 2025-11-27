import ky from "ky";
import { CalendarEventResponse } from "../types/api-types";

export const CalendarService = {
  getAllEvents: async () => {
    return await ky.get("/api/calendar/events").json<CalendarEventResponse[]>();
  },
};
