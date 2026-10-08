import Link from "next/link";
import { BarChart3, CalendarCheck, Car, ChevronRight, Dumbbell, Send, Trophy, UserPlus, type LucideIcon } from "lucide-react";
import { SectionTitle } from "@/components/app/page-header";
import { formatDayLabel, formatTime } from "@/lib/format";
import type { HomeData } from "../types";

type Item = { key: string; href: string; icon: LucideIcon; title: string; detail: string; tone: "warning" | "info" | "muted" };

const when = (date: string) => `${formatDayLabel(date)} à ${formatTime(date)}`;
const nameOf = (event: { title: string; opponent: string | null; type: string }) =>
  event.type !== "TRAINING" && event.opponent ? `Contre ${event.opponent}` : event.title;

/** "À faire": everything that waits for the user, each line opens the right page. Hidden when empty. */
export function TodoList({ todo }: { todo: HomeData["todo"] }) {
  const items: Item[] = [
    ...todo.callUpsToAnswer.map((event) => ({
      key: `callup-${event.id}`,
      href: `/app/events/${event.id}`,
      icon: CalendarCheck,
      title: `Convocation : ${nameOf(event)}`,
      detail: `${when(event.startDate)} · Réponds à ton coach`,
      tone: "warning" as const,
    })),
    ...todo.motmVotes.map((event) => ({
      key: `motm-${event.id}`,
      href: `/app/events/${event.id}`,
      icon: Trophy,
      title: `Homme du match : ${nameOf(event)}`,
      detail: `Vote avant ${formatDayLabel(event.closesAt).toLowerCase()} à ${formatTime(event.closesAt)}`,
      tone: "warning" as const,
    })),
    ...todo.carpools.map((event) => ({
      key: `carpool-${event.id}`,
      href: `/app/events/${event.id}`,
      icon: Car,
      title: `Covoiturage : ${nameOf(event)}`,
      detail:
        event.seatsLeft > 0
          ? `${when(event.startDate)} · ${event.seatsLeft} place${event.seatsLeft > 1 ? "s" : ""} libre${event.seatsLeft > 1 ? "s" : ""}`
          : `${when(event.startDate)} · Propose ta voiture ou trouve une place`,
      tone: "info" as const,
    })),
    ...todo.trainingsToAnswer.map((event) => ({
      key: `training-${event.id}`,
      href: `/app/events/${event.id}`,
      icon: Dumbbell,
      title: `Entraînement ${formatDayLabel(event.startDate).toLowerCase()}`,
      detail: `${formatTime(event.startDate)} · Dis si tu viens`,
      tone: "info" as const,
    })),
    ...(todo.joinRequests > 0
      ? [
          {
            key: "join-requests",
            href: "/app/join-requests",
            icon: UserPlus,
            title: todo.joinRequests > 1 ? `${todo.joinRequests} demandes d'adhésion` : "1 demande d'adhésion",
            detail: "Accepte ou refuse les nouveaux joueurs",
            tone: "warning" as const,
          },
        ]
      : []),
    ...todo.matchesToCallUp.map((event) => ({
      key: `tocall-${event.id}`,
      href: `/app/events/${event.id}`,
      icon: Send,
      title: `Convoquer : ${nameOf(event)}`,
      detail: `${when(event.startDate)} · Personne n'est convoqué`,
      tone: "info" as const,
    })),
    ...todo.matchesWithoutStats.map((event) => ({
      key: `stats-${event.id}`,
      href: `/app/events/${event.id}`,
      icon: BarChart3,
      title: `Score à saisir : ${nameOf(event)}`,
      detail: formatDayLabel(event.startDate),
      tone: "muted" as const,
    })),
  ];
  if (items.length === 0) return null;

  const toneClass = { warning: "bg-warning/15 text-warning", info: "bg-info/15 text-info", muted: "bg-muted text-muted-foreground" };
  return (
    <section className="space-y-2" aria-labelledby="todo-title">
      <SectionTitle>
        <span id="todo-title">À faire</span>
      </SectionTitle>
      <ul className="divide-y overflow-hidden rounded-xl border bg-card">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="flex min-h-14 items-center gap-3 px-4 py-2 outline-none hover:bg-accent/60 focus-visible:bg-accent active:bg-accent"
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${toneClass[item.tone]}`}>
                <item.icon className="size-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
