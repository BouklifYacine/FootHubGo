"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startOfToday, startOfWeek, addWeeks, isSameWeek } from "date-fns";
import { CalendarDays, CalendarPlus, List, Plus } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Page, PageHeader } from "@/components/app/page-header";
import { SegmentedControl } from "@/components/app/segmented-control";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { EventCalendar } from "@/features/calendar/components/event-calendar";
import type { ScopeOption } from "@/features/calendar/components/event-form";
import { useEvents } from "../hooks/use-events";
import type { EventListItem } from "../types";
import { AgendaEventCard } from "./agenda-event-card";
import { EventFormDialog } from "./event-form-dialog";

type When = "upcoming" | "past";
type Kind = "all" | "matches" | "trainings";

function weekLabel(weekStart: Date, now: Date) {
  const options = { weekStartsOn: 1 } as const;
  if (isSameWeek(weekStart, now, options)) return "Cette semaine";
  if (isSameWeek(weekStart, addWeeks(now, 1), options)) return "Semaine prochaine";
  if (isSameWeek(weekStart, addWeeks(now, -1), options)) return "Semaine dernière";
  return `Semaine du ${formatDate(weekStart)}`;
}

/** Events grouped by week (Monday first), in the order given. */
function groupByWeek(events: EventListItem[]) {
  const now = new Date();
  const groups: { key: string; label: string; events: EventListItem[] }[] = [];
  for (const event of events) {
    const weekStart = startOfWeek(new Date(event.startDate), { weekStartsOn: 1 });
    const key = weekStart.toISOString();
    const group = groups.at(-1);
    if (group?.key === key) group.events.push(event);
    else groups.push({ key, label: weekLabel(weekStart, now), events: [event] });
  }
  return groups;
}

/**
 * The Agenda (former Événements + Calendrier): a list of the upcoming events by default, with the
 * answer / call-up summary on each card, or the calendar. Managers create events from here.
 */
export function Agenda({ canManage, scopeOptions }: { canManage: boolean; scopeOptions?: ScopeOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") === "calendar" ? "calendar" : "list";
  const creating = searchParams.get("new") === "1" && canManage;
  const setParams = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <Page>
      <PageHeader
        title="Agenda"
        description="Matchs, entraînements et événements du club."
        actions={
          <>
            <SegmentedControl
              label="Affichage"
              value={view}
              onChange={(next) => setParams({ view: next === "calendar" ? "calendar" : null })}
              options={[
                { value: "list", label: "Liste", icon: List },
                { value: "calendar", label: "Calendrier", icon: CalendarDays },
              ]}
            />
            {canManage && (
              <Button onClick={() => setParams({ new: "1" })}>
                <Plus /> Nouvel événement
              </Button>
            )}
          </>
        }
      />
      {view === "calendar" ? (
        <EventCalendar canEdit={canManage} scopeOptions={scopeOptions} />
      ) : (
        <AgendaList canManage={canManage} onCreate={() => setParams({ new: "1" })} />
      )}
      {canManage && (
        <EventFormDialog open={creating} onOpenChange={(open) => setParams({ new: open ? "1" : null })} scopeOptions={scopeOptions} />
      )}
    </Page>
  );
}

function AgendaList({ canManage, onCreate }: { canManage: boolean; onCreate: () => void }) {
  const [when, setWhen] = useState<When>("upcoming");
  const [kind, setKind] = useState<Kind>("all");
  // Today's events stay in "À venir" all day; the past ones are newest first.
  const [today] = useState(() => startOfToday().toISOString());
  const filters = when === "upcoming" ? { from: today } : { to: today };
  const { data, isPending, error, refetch } = useEvents(filters);

  const groups = useMemo(() => {
    const events = (data ?? []).filter((event) =>
      kind === "all" ? true : kind === "trainings" ? event.type === "TRAINING" : event.type !== "TRAINING",
    );
    return groupByWeek(when === "past" ? events.toReversed() : events);
  }, [data, kind, when]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SegmentedControl
          label="Période"
          value={when}
          onChange={setWhen}
          options={[
            { value: "upcoming", label: "À venir" },
            { value: "past", label: "Passés" },
          ]}
        />
        <SegmentedControl
          label="Type d'événement"
          value={kind}
          onChange={setKind}
          options={[
            { value: "all", label: "Tout" },
            { value: "matches", label: "Matchs" },
            { value: "trainings", label: "Entraînements" },
          ]}
        />
      </div>

      {isPending ? (
        <LoadingState rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title={when === "upcoming" ? "Rien de prévu pour le moment" : "Aucun événement passé"}
          description={
            when === "upcoming"
              ? canManage
                ? "Programme un match ou tes entraînements de la semaine : tes joueurs seront prévenus."
                : "Ton coach n'a encore rien programmé."
              : undefined
          }
          action={when === "upcoming" && canManage ? { label: "Nouvel événement", onClick: onCreate, icon: Plus } : undefined}
        />
      ) : (
        groups.map((group) => (
          <section key={group.key} className="space-y-2" aria-label={group.label}>
            <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.label}</h2>
            <ul className="space-y-2">
              {group.events.map((event) => (
                <AgendaEventCard key={event.id} event={event} isPast={when === "past"} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
