# Calendar Feature

This folder contains all the components, types, utilities, and hooks for the FootHubGo calendar feature.

## Structure

```
features/calendrier/
├── components/
│   ├── index.ts                          # Main exports
│   ├── event-calendar.tsx                # Main calendar component
│   ├── calendar-dnd-context.tsx          # Drag & drop context provider
│   ├── month-view.tsx                    # Month view component
│   ├── week-view.tsx                     # Week view component
│   ├── day-view.tsx                      # Day view component
│   ├── agenda-view.tsx                   # Agenda view component
│   ├── event-dialog.tsx                  # Event creation/edit dialog
│   ├── event-item.tsx                    # Event display component
│   ├── draggable-event.tsx               # Draggable event wrapper
│   ├── droppable-cell.tsx                # Droppable cell wrapper
│   ├── events-popup.tsx                  # Events overflow popup
│   ├── constants.ts                      # Calendar constants
│   ├── utils.ts                          # Utility functions
│   ├── use-current-time-indicator.ts     # Current time indicator hook
│   └── use-event-visibility.ts           # Event visibility hook
├── types/
│   └── index.ts                          # TypeScript type definitions
└── README.md                             # This file
```

## Main Components

### EventCalendar

The main calendar component that orchestrates all views and handles event management.

**Props:**

- `events`: Array of calendar events
- `onEventAdd`: Callback when event is added
- `onEventUpdate`: Callback when event is updated
- `onEventDelete`: Callback when event is deleted
- `className`: Optional CSS class
- `initialView`: Initial view to display ('Mois' | 'week' | 'day' | 'agenda')

### View Components

- **MonthView**: Displays events in a month grid
- **WeekView**: Displays events in a week timeline with hours
- **DayView**: Displays a single day timeline
- **AgendaView**: Displays events in a list format

### Event Components

- **EventDialog**: Modal for creating/editing events
- **EventItem**: Displays a single event
- **DraggableEvent**: Makes events draggable
- **DroppableCell**: Makes calendar cells accept dropped events

## Types

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  location?: string;
}
```

### EventColor

```typescript
type EventColor = "sky" | "amber" | "violet" | "rose" | "emerald" | "orange";
```

### CalendarView

```typescript
type CalendarView = "Mois" | "week" | "day" | "agenda";
```

## Utilities

The `utils.ts` file provides several helper functions:

- `getEventColorClasses()`: Returns Tailwind classes for event colors
- `getBorderRadiusClasses()`: Returns border radius classes for multi-day events
- `isMultiDayEvent()`: Checks if an event spans multiple days
- `getEventsForDay()`: Gets events starting on a specific day
- `sortEvents()`: Sorts events (multi-day first, then by start time)
- `getSpanningEventsForDay()`: Gets events that span a day but don't start on it
- `getAllEventsForDay()`: Gets all events visible on a day
- `getAgendaEventsForDay()`: Gets events for agenda view
- `addHoursToDate()`: Adds hours to a date

## Hooks

### useCalendarDnd

Access the drag and drop context for the calendar.

### useCurrentTimeIndicator

Provides the current time indicator position for week/day views.

### useEventVisibility

Calculates how many events can be visible in month view cells.

## Usage Example

```typescript
import { EventCalendar, CalendarEvent } from "@/features/calendrier/components";

function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
  };

  return (
    <EventCalendar
      events={events}
      onEventAdd={handleEventAdd}
      onEventDelete={handleEventDelete}
      onEventUpdate={handleEventUpdate}
    />
  );
}
```

## Features

- 📅 **Multiple Views**: Month, Week, Day, and Agenda views
- 🎨 **Color Coding**: 6 different color options for events
- 🖱️ **Drag & Drop**: Move events between days and times
- ⌨️ **Keyboard Shortcuts**: Quick view switching (M, W, D, A)
- 📱 **Responsive**: Works on mobile, tablet, and desktop
- 🕐 **Current Time Indicator**: Shows current time in week/day views
- ✏️ **Event Management**: Create, edit, and delete events
- 🌙 **Dark Mode**: Full dark mode support
- ♿ **Accessibility**: ARIA labels and keyboard navigation

## Constants

Key configurable constants (in `constants.ts`):

- `EventHeight`: Height of events in pixels (24px)
- `EventGap`: Gap between events (4px)
- `WeekCellsHeight`: Height of hour cells in week/day view (64px)
- `AgendaDaysToShow`: Number of days shown in agenda (30)
- `StartHour`: Start hour for timeline (0)
- `EndHour`: End hour for timeline (24)
- `DefaultStartHour`: Default event start time (9 AM)
- `DefaultEndHour`: Default event end time (10 AM)

## Notes

- All components are "use client" as they require client-side interactivity
- The calendar uses `date-fns` for date manipulation
- Drag & drop functionality uses `@dnd-kit/core`
- Events snap to 15-minute intervals when dragging
