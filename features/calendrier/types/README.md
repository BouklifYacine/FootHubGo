# Calendar Types

This folder contains all TypeScript type definitions for the calendar feature.

## Types Defined

### CalendarEvent

The main event type used throughout the calendar.

```typescript
interface CalendarEvent {
  id: string; // Unique identifier
  title: string; // Event title
  description?: string; // Optional description
  start: Date; // Start date/time
  end: Date; // End date/time
  allDay?: boolean; // All-day event flag
  color?: EventColor; // Event color
  location?: string; // Optional location
}
```

### CalendarView

The available calendar view modes.

```typescript
type CalendarView = "Mois" | "week" | "day" | "agenda";
```

- **Mois**: Month view with grid layout
- **week**: Week view with hourly timeline (7 days)
- **day**: Day view with hourly timeline (single day)
- **agenda**: List view showing upcoming events

### EventColor

Available color options for events.

```typescript
type EventColor = "sky" | "amber" | "violet" | "rose" | "emerald" | "orange";
```

Each color has associated Tailwind classes defined in `utils.ts`:

- **sky**: Blue tones
- **amber**: Yellow-orange tones
- **violet**: Purple tones
- **rose**: Pink tones
- **emerald**: Green tones
- **orange**: Orange tones

## Adding New Types

### Adding a New Event Color

1. Update the `EventColor` type in this file:

```typescript
export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange"
  | "purple" // Your new color
  | "blue"; // Another new color
```

2. Add color classes in `components/utils.ts`:

```typescript
case "purple":
  return "bg-purple-200/50 hover:bg-purple-200/40 text-purple-950/80 dark:bg-purple-400/25 dark:hover:bg-purple-400/20 dark:text-purple-200 shadow-purple-700/8";
```

3. Add color option in `components/event-dialog.tsx`:

```typescript
{
  value: "purple",
  label: "Purple",
  bgClass: "bg-purple-400 data-[state=checked]:bg-purple-400",
  borderClass: "border-purple-400 data-[state=checked]:border-purple-400",
}
```

### Adding Custom Event Properties

To add custom properties to events:

1. Extend the `CalendarEvent` interface:

```typescript
export interface CalendarEvent {
  id: string;
  title: string;
  // ... existing properties
  customField?: string; // Your custom field
  attendees?: string[]; // Example: list of attendees
  priority?: "low" | "medium" | "high"; // Example: priority
}
```

2. Update the event dialog to capture these fields
3. Update the event display components to show them

### Adding a New View Type

To add a new view type:

1. Update the `CalendarView` type:

```typescript
export type CalendarView = "Mois" | "week" | "day" | "agenda" | "year"; // Your new view
```

2. Create a new view component in `components/`
3. Update the main `EventCalendar` component to support it

## Usage

Import types wherever needed:

```typescript
import type {
  CalendarEvent,
  CalendarView,
  EventColor,
} from "@/features/calendrier/types";
```

Or import through the components barrel export:

```typescript
import type { CalendarEvent } from "@/features/calendrier/components";
```

## Type Safety

All calendar components use these types to ensure:

- ✅ Consistent event structure
- ✅ Type-safe props
- ✅ Autocomplete in IDE
- ✅ Compile-time error checking

Make sure to keep types updated when modifying the calendar functionality!
