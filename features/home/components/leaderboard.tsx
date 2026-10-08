"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { SectionTitle } from "@/components/app/page-header";
import { SegmentedControl } from "@/components/app/segmented-control";
import { playerPositionLabels } from "@/lib/enum-labels";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import type { HomeData } from "../types";

/** Top scorers / top assists of the section. */
export function Leaderboard({ topScorers, topAssists }: Pick<HomeData, "topScorers" | "topAssists">) {
  const [view, setView] = useState<"goals" | "assists">("goals");
  const players = view === "goals" ? topScorers : topAssists;
  const unit = (value: number) => (view === "goals" ? (value > 1 ? "buts" : "but") : value > 1 ? "passes" : "passe");

  return (
    <section className="space-y-2" aria-labelledby="leaderboard-title">
      <SectionTitle
        action={
          <SegmentedControl
            label="Classement"
            value={view}
            onChange={setView}
            options={[
              { value: "goals", label: "Buteurs" },
              { value: "assists", label: "Passeurs" },
            ]}
          />
        }
      >
        <span id="leaderboard-title">Classement</span>
      </SectionTitle>
      {topScorers.length === 0 && topAssists.length === 0 ? (
        <EmptyState icon={TrendingUp} title="Pas encore de classement" description="Il apparaîtra après les premiers matchs." />
      ) : players.length === 0 ? (
        <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
          {view === "goals" ? "Aucun buteur pour le moment" : "Aucun passeur pour le moment"}
        </p>
      ) : (
        <ol className="divide-y overflow-hidden rounded-xl border bg-card">
          {players.map((player, index) => (
            <li key={player.userId} className="flex min-h-12 items-center gap-3 px-4 py-2">
              <span className="w-4 text-sm font-semibold text-muted-foreground tabular-nums">{index + 1}</span>
              <InitialsAvatar name={player.name} src={player.image} className="size-9" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{player.name}</span>
                {player.position && (
                  <span className="block truncate text-xs text-muted-foreground">{playerPositionLabels[player.position]}</span>
                )}
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {player.value} <span className="font-normal text-muted-foreground">{unit(player.value)}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
