// Main calendar component
export { EventCalendar } from "./event-calendar";

// Types and constants
export type { CalendarEvent, CalendarView, EventColor } from "../types";
export {
  EventHeight,
  EventGap,
  WeekCellsHeight,
  AgendaDaysToShow,
  StartHour,
  EndHour,
  DefaultStartHour,
  DefaultEndHour,
} from "./constants";

// View components
export { MonthView } from "./month-view";
export { WeekView } from "./week-view";
export { DayView } from "./day-view";
export { AgendaView } from "./agenda-view";

// Dialog and event components
export { EventDialog } from "./event-dialog";
export { EventItem } from "./event-item";
export { DraggableEvent } from "./draggable-event";
export { DroppableCell } from "./droppable-cell";
export { EventsPopup } from "./events-popup";

// Context
export { CalendarDndProvider, useCalendarDnd } from "./calendar-dnd-context";

// Utils and hooks
export {
  getEventColorClasses,
  getBorderRadiusClasses,
  isMultiDayEvent,
  getEventsForDay,
  sortEvents,
  getSpanningEventsForDay,
  getAllEventsForDay,
  getAgendaEventsForDay,
  addHoursToDate,
} from "./utils";

export { useCurrentTimeIndicator } from "./use-current-time-indicator";
export { useEventVisibility } from "./use-event-visibility";
