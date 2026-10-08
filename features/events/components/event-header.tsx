import { CalendarDays, MapPin, Repeat } from "lucide-react";
import type { MatchResult } from "@/generated/prisma/browser";
import { Badge } from "@/components/ui/badge";
import { formatDateLong, formatTime } from "@/lib/format";
import { matchResultLabels } from "@/lib/enum-labels";
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { EVENT_TYPES } from "../event-types";
import type { EventDetail } from "../types";

const resultVariant: Record<MatchResult, "success" | "danger" | "muted"> = { WIN: "success", LOSS: "danger", DRAW: "muted" };

/** Top of the event page: type, teams and THE score (shown once), date, time and place. */
export function EventHeader({ event }: { event: EventDetail }) {
  const score = event.teamStat;
  const type = EVENT_TYPES[event.type];

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card p-4 md:p-6">
      <div className={cn("absolute inset-x-0 top-0 h-1", type.accentClass)} aria-hidden />
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={type.badgeClass}>{type.label}</Badge>
        {event.isClubEvent && <Badge variant="outline">Tout le club</Badge>}
        {event.type !== "TRAINING" && !event.isClubEvent && (
          <Badge variant="outline">{event.isHome ? "Domicile" : "Extérieur"}</Badge>
        )}
        {event.seriesId && (
          <Badge variant="muted">
            <Repeat aria-hidden /> Chaque semaine
          </Badge>
        )}
        {score && <Badge variant={resultVariant[score.result]}>{matchResultLabels[score.result]}</Badge>}
      </div>

      {event.type === "TRAINING" || event.isClubEvent ? (
        <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{event.title}</h1>
      ) : (
        <>
          <h1 className="sr-only">
            {event.team.name} contre {event.opponent ?? "l'adversaire"}
          </h1>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <TeamSide name={event.team.name} logoUrl={event.team.logoUrl} />
            <span className="text-3xl font-bold tabular-nums md:text-5xl">
              {score ? `${score.goalsFor} - ${score.goalsAgainst}` : <span className="text-xl text-muted-foreground">contre</span>}
            </span>
            <TeamSide name={event.opponent ?? "Adversaire"} />
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">{event.title}</p>
        </>
      )}

      <div className="mt-4 flex flex-col gap-1.5 text-sm md:flex-row md:gap-5">
        <span className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
          <span className="first-letter:uppercase">{formatDateLong(event.startDate)}</span> à {formatTime(event.startDate)}
        </span>
        <span className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          {event.location ? (
            <a
              className="underline-offset-4 hover:underline"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
              target="_blank"
              rel="noreferrer"
            >
              {event.location}
            </a>
          ) : (
            <span className="text-muted-foreground">Lieu non indiqué</span>
          )}
        </span>
      </div>
      {event.description && <p className="mt-3 text-sm whitespace-pre-line text-muted-foreground">{event.description}</p>}
    </section>
  );
}

function TeamSide({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <InitialsAvatar name={name} src={logoUrl} className="size-12 md:size-16" />
      <span className="line-clamp-2 text-sm font-semibold md:text-lg">{name}</span>
    </div>
  );
}
