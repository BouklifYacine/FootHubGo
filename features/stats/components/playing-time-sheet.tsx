"use client";

import { useState } from "react";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/app/responsive-dialog";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { savePlayingTime } from "../actions";
import { statsInvalidation } from "../hooks/use-event-stats";
import {
  MAX_MINUTES,
  MINUTE_PRESETS,
  STARTER_DEFAULT_MINUTES,
  SUBSTITUTE_DEFAULT_MINUTES,
  playingTimeError,
  type PlayingTimeEntry,
} from "../playing-time";
import type { EventPlayerStat, PresentPlayer } from "../types";
import { MinutePresets } from "./minute-presets";

type Role = "starter" | "substitute" | "none";

const roleOf = (entry: PlayingTimeEntry): Role => (entry.isStarter ? "starter" : entry.minutes > 0 ? "substitute" : "none");

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "starter", label: "Titulaire" },
  { value: "substitute", label: "Entré" },
  { value: "none", label: "Pas joué" },
];

/**
 * The coach's playing-time sheet: every present player (confirmed call-up) on one screen, one tap
 * per player (Titulaire = 90', Entré = 30', Pas joué), then adjust the minutes with the presets.
 */
export function PlayingTimeSheet({
  eventId,
  players,
  stats,
}: {
  eventId: string;
  players: PresentPlayer[];
  stats: EventPlayerStat[];
}) {
  const [open, setOpen] = useState(false);
  const hasMinutes = stats.some((stat) => stat.minutesPlayed > 0);

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button className="w-full md:w-auto">
          <Timer /> {hasMinutes ? "Modifier le temps de jeu" : "Saisir le temps de jeu"}
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="flex max-h-[92dvh] flex-col sm:max-w-xl">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Temps de jeu</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Les joueurs présents au match. Titulaire = {STARTER_DEFAULT_MINUTES}&apos;, ajuste ensuite si besoin (prolongations
            comprises, {MAX_MINUTES}&apos; maximum).
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {/* Mounted only while open: the sheet always starts from the saved values */}
        {open && <SheetForm eventId={eventId} players={players} stats={stats} onDone={() => setOpen(false)} />}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function SheetForm({
  eventId,
  players,
  stats,
  onDone,
}: {
  eventId: string;
  players: PresentPlayer[];
  stats: EventPlayerStat[];
  onDone: () => void;
}) {
  const save = useActionMutation(savePlayingTime, { invalidate: statsInvalidation, onSuccess: onDone });
  const [entries, setEntries] = useState<PlayingTimeEntry[]>(() =>
    players.map((player) => {
      const stat = stats.find((row) => row.userId === player.userId);
      return { userId: player.userId, minutes: stat?.minutesPlayed ?? 0, isStarter: stat?.isStarter ?? false };
    }),
  );
  const [error, setError] = useState<string | null>(null);

  const update = (userId: string, change: (entry: PlayingTimeEntry) => PlayingTimeEntry) =>
    setEntries((current) => current.map((entry) => (entry.userId === userId ? change(entry) : entry)));

  const setRole = (userId: string, role: Role) =>
    update(userId, (entry) => {
      if (role === "none") return { ...entry, isStarter: false, minutes: 0 };
      if (role === "starter") return { ...entry, isStarter: true, minutes: entry.isStarter ? entry.minutes : STARTER_DEFAULT_MINUTES };
      return { ...entry, isStarter: false, minutes: roleOf(entry) === "substitute" ? entry.minutes : SUBSTITUTE_DEFAULT_MINUTES };
    });

  const starters = entries.filter((entry) => entry.isStarter).length;
  const substitutes = entries.filter((entry) => !entry.isStarter && entry.minutes > 0).length;

  const submit = () => {
    const message = playingTimeError(entries, players.map((player) => player.userId));
    setError(message);
    if (!message) save.mutate({ eventId, entries });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {starters} titulaire{starters > 1 ? "s" : ""} · {substitutes} entré{substitutes > 1 ? "s" : ""} en jeu
      </p>
      <ul className="-mx-1 min-h-0 flex-1 divide-y overflow-y-auto px-1">
        {players.map((player) => {
          const entry = entries.find((row) => row.userId === player.userId)!;
          const role = roleOf(entry);
          return (
            <li key={player.userId} className="space-y-2 py-3">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={player.user.name} src={player.user.image} className="size-9" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{player.user.name}</span>
                <div role="radiogroup" aria-label={`Temps de jeu de ${player.user.name}`} className="flex rounded-lg bg-muted p-0.5">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={role === option.value}
                      onClick={() => setRole(player.userId, option.value)}
                      className={cn(
                        "min-h-10 rounded-md px-2 text-xs font-medium whitespace-nowrap text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 md:min-h-8",
                        role === option.value && "bg-background text-foreground shadow-sm",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {role !== "none" && (
                <div className="flex items-center gap-2 pl-12">
                  <label className="sr-only" htmlFor={`minutes-${player.userId}`}>
                    Minutes jouées par {player.user.name}
                  </label>
                  <Input
                    id={`minutes-${player.userId}`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_MINUTES}
                    value={entry.minutes}
                    onChange={(e) =>
                      update(player.userId, (current) => ({ ...current, minutes: e.target.value === "" ? 0 : e.target.valueAsNumber }))
                    }
                    className="w-20 shrink-0 tabular-nums"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                  <MinutePresets
                    className="flex-nowrap overflow-x-auto"
                    presets={role === "starter" ? MINUTE_PRESETS.slice(0, 3) : MINUTE_PRESETS.slice(3)}
                    value={entry.minutes}
                    onChange={(minutes) => update(player.userId, (current) => ({ ...current, minutes }))}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <ResponsiveDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ResponsiveDialogClose asChild>
          <Button type="button" variant="outline">
            Annuler
          </Button>
        </ResponsiveDialogClose>
        <Button type="button" onClick={submit} disabled={save.isPending}>
          Enregistrer
        </Button>
      </ResponsiveDialogFooter>
    </div>
  );
}
