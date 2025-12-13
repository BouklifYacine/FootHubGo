"use client";

import { RiCalendarCheckLine } from "@remixicon/react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { fr } from "date-fns/locale"; // French locale
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Filter,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { CalendarEvent, CalendarView } from "../types";
import {
  AgendaDaysToShow,
  EventGap,
  EventHeight,
  WeekCellsHeight,
} from "./constants";
import { addHoursToDate } from "./utils";
import { CalendarDndProvider } from "./calendar-dnd-context";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { AgendaView } from "./agenda-view";
import { EventDialog } from "./event-dialog";

export interface EventCalendarProps {
  events?: CalendarEvent[];
  onEventAdd?: (event: CalendarEvent) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  className?: string;
  initialView?: CalendarView;
  canEdit?: boolean;
}

export function EventCalendar({
  events = [],
  onEventAdd,
  onEventUpdate,
  onEventDelete,
  className,
  initialView = "Mois",
  canEdit = false,
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>(initialView);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // Filter state - Default to empty (shows all events)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // If no filters are selected, show all events
      if (selectedTypes.length === 0) return true;

      // If event doesn't have a type, show it only if no filters active (already handled above)
      // or deciding how to handle untyped events in strict filter mode...
      // For now, if strict filter is active, untyped events are hidden unless we add an "Other" category.
      if (!event.typeEvenement) return false;

      return selectedTypes.includes(event.typeEvenement);
    });
  }, [events, selectedTypes]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Add keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input, textarea or contentEditable element
      // or if the event dialog is open
      if (
        isEventDialogOpen ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "m":
          setView("Mois");
          break;
        case "w":
          setView("week");
          break;
        case "d":
          setView("day");
          break;
        case "a":
          setView("agenda");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEventDialogOpen]);

  const handlePrevious = () => {
    if (view === "Mois") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, -1));
    } else if (view === "agenda") {
      // For agenda view, go back 30 days (a full month)
      setCurrentDate(addDays(currentDate, -AgendaDaysToShow));
    }
  };

  const handleNext = () => {
    if (view === "Mois") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === "day") {
      setCurrentDate(addDays(currentDate, 1));
    } else if (view === "agenda") {
      // For agenda view, go forward 30 days (a full month)
      setCurrentDate(addDays(currentDate, AgendaDaysToShow));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventSelect = (event: CalendarEvent) => {
    console.log("Event selected:", event); // Debug log
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleEventCreate = (startTime: Date) => {
    if (!canEdit) return; // RBAC check

    console.log("Creating new event at:", startTime); // Debug log

    // Snap to 15-minute intervals
    const minutes = startTime.getMinutes();
    const remainder = minutes % 15;
    if (remainder !== 0) {
      if (remainder < 7.5) {
        // Round down to nearest 15 min
        startTime.setMinutes(minutes - remainder);
      } else {
        // Round up to nearest 15 min
        startTime.setMinutes(minutes + (15 - remainder));
      }
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);
    }

    const newEvent: CalendarEvent = {
      allDay: false,
      end: addHoursToDate(startTime, 1),
      id: "",
      start: startTime,
      title: "",
    };
    setSelectedEvent(newEvent);
    setIsEventDialogOpen(true);
  };

  const handleEventSave = (event: CalendarEvent) => {
    if (!canEdit) return;

    if (event.id) {
      onEventUpdate?.(event);
      toast.success(`Événement "${event.title}" mis à jour`);
    } else {
      onEventAdd?.({
        ...event,
        id: Math.random().toString(36).substring(2, 11),
      });
      toast.success(`Événement "${event.title}" ajouté`);
    }
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventDelete = (eventId: string) => {
    if (!canEdit) return;

    const deletedEvent = events.find((e) => e.id === eventId);
    onEventDelete?.(eventId);
    setIsEventDialogOpen(false);
    setSelectedEvent(null);

    // Show toast notification when an event is deleted
    if (deletedEvent) {
      toast.success(`Événement "${deletedEvent.title}" supprimé`);
    }
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    if (!canEdit) return;

    onEventUpdate?.(updatedEvent);

    // Show toast notification when an event is updated via drag and drop
    // toast.success(`Événement "${updatedEvent.title}" déplacé`);
  };

  const viewTitle = useMemo(() => {
    if (view === "Mois") {
      return format(currentDate, "MMMM yyyy", { locale: fr });
    }
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday in France
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy", { locale: fr });
      }
      return `${format(start, "MMM", { locale: fr })} - ${format(end, "MMM yyyy", { locale: fr })}`;
    }
    if (view === "day") {
      return (
        <>
          <span aria-hidden="true" className="min-[480px]:hidden">
            {format(currentDate, "d MMM yyyy", { locale: fr })}
          </span>
          <span aria-hidden="true" className="max-[479px]:hidden min-md:hidden">
            {format(currentDate, "d MMMM yyyy", { locale: fr })}
          </span>
          <span className="max-md:hidden">
            {format(currentDate, "EEEE d MMMM yyyy", { locale: fr })}
          </span>
        </>
      );
    }
    if (view === "agenda") {
      // Show the month range for agenda view
      const start = currentDate;
      const end = addDays(currentDate, AgendaDaysToShow - 1);

      if (isSameMonth(start, end)) {
        return format(start, "MMMM yyyy", { locale: fr });
      }
      return `${format(start, "MMM", { locale: fr })} - ${format(end, "MMM yyyy", { locale: fr })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: fr });
  }, [currentDate, view]);

  return (
    <div
      className="flex flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
      style={
        {
          "--event-gap": `${EventGap}px`,
          "--event-height": `${EventHeight}px`,
          "--week-cells-height": `${WeekCellsHeight}px`,
        } as React.CSSProperties
      }
    >
      <CalendarDndProvider onEventUpdate={handleEventUpdate}>
        <div
          className={cn(
            "flex items-center justify-between p-2 sm:p-4",
            className
          )}
        >
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              className="max-[479px]:aspect-square max-[479px]:p-0! cursor-pointer"
              onClick={handleToday}
              variant="outline"
            >
              <RiCalendarCheckLine
                aria-hidden="true"
                className="min-[480px]:hidden"
                size={16}
              />
              <span className="max-[479px]:sr-only">Aujourd'hui</span>
            </Button>
            <div className="flex items-center sm:gap-2">
              <Button
                aria-label="Previous"
                onClick={handlePrevious}
                size="icon"
                variant="ghost"
              >
                <ChevronLeftIcon aria-hidden="true" size={16} />
              </Button>
              <Button
                aria-label="Next"
                onClick={handleNext}
                size="icon"
                variant="ghost"
              >
                <ChevronRightIcon aria-hidden="true" size={16} />
              </Button>
            </div>
            <h2 className="capitalize font-semibold text-sm sm:text-lg md:text-xl">
              {viewTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter size={16} />
                  <span className="max-sm:hidden">Filtrer</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">
                    Types d'événements
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-entrainement"
                        checked={selectedTypes.includes("ENTRAINEMENT")}
                        onCheckedChange={() => toggleType("ENTRAINEMENT")}
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <Label htmlFor="filter-entrainement">Entraînement</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-championnat"
                        checked={selectedTypes.includes("CHAMPIONNAT")}
                        onCheckedChange={() => toggleType("CHAMPIONNAT")}
                        className="data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
                      />
                      <Label htmlFor="filter-championnat">Championnat</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-coupe"
                        checked={selectedTypes.includes("COUPE")}
                        onCheckedChange={() => toggleType("COUPE")}
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <Label htmlFor="filter-coupe">Coupe</Label>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-1.5 max-[479px]:h-8" variant="outline">
                  <span>
                    <span aria-hidden="true" className="min-[480px]:hidden">
                      {view.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-[479px]:sr-only">
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </span>
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="-me-1 opacity-60"
                    size={16}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-32">
                <DropdownMenuItem onClick={() => setView("Mois")}>
                  Mois <DropdownMenuShortcut>M</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("week")}>
                  Semaine <DropdownMenuShortcut>W</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("day")}>
                  Jour <DropdownMenuShortcut>D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setView("agenda")}>
                  Agenda <DropdownMenuShortcut>A</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canEdit && (
              <Button
                className="max-[479px]:aspect-square max-[479px]:p-0!"
                onClick={() => {
                  setSelectedEvent(null); // Ensure we're creating a new event
                  setIsEventDialogOpen(true);
                }}
                size="sm"
              >
                <PlusIcon
                  aria-hidden="true"
                  className="sm:-ms-1 opacity-60"
                  size={16}
                />
                <span className="max-sm:sr-only">Nouvel événement</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {view === "Mois" && (
            <MonthView
              currentDate={currentDate}
              events={filteredEvents}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === "week" && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === "day" && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              onEventCreate={handleEventCreate}
              onEventSelect={handleEventSelect}
            />
          )}
          {view === "agenda" && (
            <AgendaView
              currentDate={currentDate}
              events={filteredEvents}
              onEventSelect={handleEventSelect}
            />
          )}
        </div>

        <EventDialog
          event={selectedEvent}
          isOpen={isEventDialogOpen}
          onClose={() => {
            setIsEventDialogOpen(false);
            setSelectedEvent(null);
          }}
          canEdit={canEdit}
        />
      </CalendarDndProvider>
    </div>
  );
}
