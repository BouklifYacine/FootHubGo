import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AlarmClock, CalendarDays, House } from "lucide-react";
import type { MatchResult } from "@/generated/prisma/browser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { matchResultLabels } from "@/lib/enum-labels";
import { EVENT_TYPES } from "../event-types";
import type { EventDetail } from "../types";

const resultClass: Record<MatchResult, string> = {
  WIN: "bg-green-500 text-white",
  LOSS: "bg-red-500 text-white",
  DRAW: "bg-gray-500 text-white",
};

function TeamSide({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
      <Avatar className="size-10 md:size-16">
        <AvatarImage src={logoUrl ?? undefined} alt={name} className="object-contain" />
        <AvatarFallback className="text-lg font-bold">{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <span className="text-center font-bold md:text-3xl">{name}</span>
    </div>
  );
}

/** Scoreboard-like summary of an event (score once team stats exist). */
export function EventHeader({ event }: { event: EventDetail }) {
  const score = event.teamStat;

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-blue-500 p-6 md:p-10">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge className={EVENT_TYPES[event.type].badgeClass}>{EVENT_TYPES[event.type].label}</Badge>
        {score && <Badge className={resultClass[score.result]}>{matchResultLabels[score.result]}</Badge>}
      </div>

      {event.type === "TRAINING" ? (
        <h1 className="mt-4 text-center text-2xl font-bold tracking-tighter md:text-4xl">{event.title}</h1>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-2">
          <TeamSide name={event.team.name} logoUrl={event.team.logoUrl} />
          <span className="text-2xl font-bold md:text-5xl">
            {score ? `${score.goalsFor} - ${score.goalsAgainst}` : "vs"}
          </span>
          <TeamSide name={event.opponent ?? "Adversaire"} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground md:text-base">
        <span className="flex items-center gap-1">
          <CalendarDays className="size-4" /> {format(event.startDate, "EEEE d MMMM yyyy", { locale: fr })}
        </span>
        <span className="flex items-center gap-1">
          <AlarmClock className="size-4" /> {format(event.startDate, "HH'h'mm")}
        </span>
        <span className="flex items-center gap-1">
          <House className="size-4" /> {event.location || "Lieu non indiqué"}
        </span>
      </div>
      {event.description && (
        <p className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-center text-sm text-muted-foreground">
          {event.description}
        </p>
      )}
    </div>
  );
}
