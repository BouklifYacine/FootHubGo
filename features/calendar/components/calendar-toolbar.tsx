"use client";

import type { CalendarController } from "@fullcalendar/react";
import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import type { EventType } from "@/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_TYPE_KEYS, EVENT_TYPES } from "@/features/events/event-types";

export const CALENDAR_VIEWS = {
  dayGridMonth: "Mois",
  timeGridWeek: "Semaine",
  timeGridDay: "Jour",
  listMonth: "Liste",
} as const;

type Props = {
  controller: CalendarController;
  /** Event types shown; empty = all. */
  types: EventType[];
  onTypesChange: (types: EventType[]) => void;
  onCreate?: () => void;
};

/** shadcn-styled toolbar driving FullCalendar through its controller. */
export function CalendarToolbar({ controller, types, onTypesChange, onCreate }: Props) {
  const toggleType = (type: EventType) =>
    onTypesChange(types.includes(type) ? types.filter((t) => t !== type) : [...types, type]);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-4">
      <div className="flex items-center gap-1 sm:gap-3">
        <Button variant="outline" onClick={() => controller.today()}>
          Aujourd&apos;hui
        </Button>
        <Button size="icon" variant="ghost" aria-label="Précédent" onClick={() => controller.prev()}>
          <ChevronLeft />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Suivant" onClick={() => controller.next()}>
          <ChevronRight />
        </Button>
        <h2 className="text-sm font-semibold capitalize sm:text-lg md:text-xl">{controller.view?.title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter /> <span className="max-sm:sr-only">Filtrer</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 space-y-3" align="end">
            <h4 className="font-medium leading-none">Types d&apos;événements</h4>
            {EVENT_TYPE_KEYS.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`filter-${type}`}
                  checked={types.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                />
                <span className="size-2.5 rounded-full" style={{ background: EVENT_TYPES[type].color }} />
                <Label htmlFor={`filter-${type}`}>{EVENT_TYPES[type].label}</Label>
              </div>
            ))}
          </PopoverContent>
        </Popover>

        <Select value={controller.view?.type} onValueChange={(view) => controller.changeView(view)}>
          <SelectTrigger className="h-8 w-28" aria-label="Vue">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CALENDAR_VIEWS).map(([view, label]) => (
              <SelectItem key={view} value={view}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {onCreate && (
          <Button size="sm" onClick={onCreate}>
            <Plus /> <span className="max-sm:sr-only">Nouvel événement</span>
          </Button>
        )}
      </div>
    </div>
  );
}
