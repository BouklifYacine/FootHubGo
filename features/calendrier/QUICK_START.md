# Quick Start Guide - Calendar Components

## Overview

All calendar components are now available in `features/calendrier/components` and ready for you to customize!

## File Structure

```
features/calendrier/
├── components/
│   ├── index.ts                          ← Import everything from here
│   ├── event-calendar.tsx                ← Main component
│   ├── month-view.tsx                    ← Play with month view
│   ├── week-view.tsx                     ← Play with week view
│   ├── day-view.tsx                      ← Play with day view
│   ├── agenda-view.tsx                   ← Play with agenda view
│   ├── event-dialog.tsx                  ← Play with event dialog
│   ├── event-item.tsx                    ← Play with event styling
│   └── ... (all other components)
├── README.md                             ← Full documentation
└── COMPONENTS_SUMMARY.md                 ← This file
```

## What Can You Do Now?

### 1. Customize Event Styling

Edit `event-item.tsx` to change how events look:

- Colors
- Borders
- Shadows
- Hover effects

### 2. Modify View Layouts

Edit the view components:

- `month-view.tsx` - Change grid layout
- `week-view.tsx` - Adjust hour heights
- `day-view.tsx` - Modify time slots
- `agenda-view.tsx` - Change list display

### 3. Adjust Event Dialog

Edit `event-dialog.tsx` to:

- Add more fields
- Change form layout
- Add validation
- Customize colors

### 4. Update Constants

Edit `constants.ts` to change:

```typescript
export const EventHeight = 24; // Event height in pixels
export const EventGap = 4; // Gap between events
export const WeekCellsHeight = 64; // Hour cell height
export const AgendaDaysToShow = 30; // Days in agenda view
```

### 5. Add Custom Utilities

Edit `utils.ts` to add your own helper functions for:

- Event filtering
- Date calculations
- Color schemes
- Event sorting

## Import Examples

```typescript
// Import main component
import { EventCalendar } from "@/features/calendrier/components";

// Import types
import type {
  CalendarEvent,
  CalendarView,
  EventColor,
} from "@/features/calendrier/components";

// Import utils
import {
  getEventColorClasses,
  isMultiDayEvent,
} from "@/features/calendrier/components";

// Import constants
import { EventHeight, WeekCellsHeight } from "@/features/calendrier/components";

// Import hooks
import {
  useCurrentTimeIndicator,
  useEventVisibility,
} from "@/features/calendrier/components";

// Import specific components if needed
import { MonthView, WeekView, DayView } from "@/features/calendrier/components";
```

## Common Customizations

### Change Event Colors

Open `types.ts` and add more colors:

```typescript
export type EventColor =
  | "sky"
  | "amber"
  | "violet"
  | "rose"
  | "emerald"
  | "orange"
  | "blue" // Add your own!
  | "purple" // Add your own!
  | "green"; // Add your own!
```

Then update `utils.ts` to add the color classes.

### Change Time Range

Open `constants.ts`:

```typescript
export const StartHour = 6; // Start at 6 AM
export const EndHour = 22; // End at 10 PM
```

### Change Agenda Period

Open `constants.ts`:

```typescript
export const AgendaDaysToShow = 60; // Show 60 days instead of 30
```

### Customize Event Height

Open `constants.ts`:

```typescript
export const EventHeight = 32; // Make events taller
export const EventGap = 8; // More space between events
```

## Testing Your Changes

The calendar is used in:

- `app/dashboardfoothub/calendrier/page.tsx`

Just navigate to `/dashboardfoothub/calendrier` in your app to see your changes!

## Tips

1. **Start Small**: Make one change at a time
2. **Use TypeScript**: The types will help you avoid errors
3. **Check Console**: Look for any errors in the browser console
4. **Read README.md**: Full documentation is available
5. **Experiment**: These components are yours to customize!

## Common Files to Modify

### For Styling Changes

- `event-item.tsx` - Event appearance
- `utils.ts` - Color classes

### For Layout Changes

- `month-view.tsx` - Month grid
- `week-view.tsx` - Week timeline
- `day-view.tsx` - Day timeline
- `agenda-view.tsx` - List view

### For Functionality Changes

- `event-calendar.tsx` - Main logic
- `event-dialog.tsx` - Event form
- `calendar-dnd-context.tsx` - Drag & drop

### For Configuration

- `constants.ts` - All configurable values
- `types.ts` - Type definitions

## Need Help?

Check out:

1. `README.md` - Comprehensive documentation
2. TypeScript hints in your IDE
3. Comments in the code
4. The working example in `page.tsx`

Happy coding! 🎨
