import { Calendar, CalendarX, MapPin, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EVENT_TYPES } from "@/features/events/event-types";
import type { HomeData } from "../types";
import { EmptyState } from "./empty-state";

const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR");
const formatTime = (date: string) =>
  new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** The next 3 league / cup matches of the team. */
export function UpcomingMatches({ matches, teamName }: { matches: HomeData["upcomingMatches"]; teamName: string }) {
  if (matches.length === 0) {
    return (
      <EmptyState
        icon={CalendarX}
        title="Aucun match à venir"
        text="Les prochains matchs s'afficheront ici une fois programmés"
      />
    );
  }

  return (
    <div className="w-full">
      <h3 className="mb-4 text-base font-medium tracking-tight lg:mb-6 lg:text-lg">Prochains matchs</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {matches.map((match) => (
          <div
            key={match.id}
            className="flex flex-col gap-4 rounded-xl border border-gray-200/60 p-4 transition-shadow hover:shadow-lg lg:rounded-2xl lg:p-6 dark:border-gray-700/50"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge className={cn(EVENT_TYPES[match.type].badgeClass, "rounded-full text-xs font-semibold")}>
                {EVENT_TYPES[match.type].label}
              </Badge>
              {match.location && (
                <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium tracking-tight lg:text-sm">
                  <MapPin className="size-4 shrink-0" />
                  <span className="truncate">{match.location}</span>
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-4 text-xs font-medium lg:text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {formatDate(match.startDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Timer className="size-4" />
                {formatTime(match.startDate)}
              </span>
            </div>
            <p className="mt-auto text-center text-sm font-bold tracking-tight lg:text-base">
              {teamName} <span className="font-normal text-muted-foreground">vs</span> {match.opponent ?? "?"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
