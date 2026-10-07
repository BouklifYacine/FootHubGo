"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { playerPositionLabels } from "@/lib/enum-labels";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import type { HomeData } from "../types";
import { EmptyState } from "@/components/app/empty-state";

/** Top scorers / top assists of the team, toggled with a switch. */
export function Leaderboard({ topScorers, topAssists }: Pick<HomeData, "topScorers" | "topAssists">) {
  const [showGoals, setShowGoals] = useState(true);

  if (topScorers.length === 0 && topAssists.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Aucune statistique disponible"
        bare
        description="Les classements apparaîtront après les premiers matchs"
      />
    );
  }

  const players = showGoals ? topScorers : topAssists;
  const unit = (value: number) => (showGoals ? (value > 1 ? "Buts" : "But") : value > 1 ? "Passes" : "Passe");

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center lg:mb-5">
        <h3 className="text-base font-bold tracking-tight lg:text-lg">
          {showGoals ? "Classement buteurs" : "Classement passeurs"}
        </h3>
        <div className="flex items-center gap-2">
          <Switch id="leaderboard-toggle" checked={showGoals} onCheckedChange={setShowGoals} />
          <Label htmlFor="leaderboard-toggle" className="cursor-pointer text-xs tracking-tight lg:text-sm">
            {showGoals ? "Buteurs" : "Passeurs"}
          </Label>
        </div>
      </div>

      {players.length === 0 ? (
        <p className="py-8 text-center text-xs text-gray-500 lg:text-sm">
          {showGoals ? "Aucun buteur pour le moment" : "Aucun passeur pour le moment"}
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {players.map((player) => (
            <li key={player.userId} className="flex items-center justify-between py-2 lg:py-3">
              <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-3">
                <InitialsAvatar name={player.name} src={player.image} className="size-12 lg:size-14" />
                <div className="flex min-w-0 flex-col">
                  <p className="truncate text-sm font-medium tracking-tight lg:text-base">{player.name}</p>
                  {player.position && (
                    <Badge className="mt-1 w-fit px-2 py-0.5 text-xs tracking-tight">
                      {playerPositionLabels[player.position]}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="ml-2 shrink-0 text-sm font-semibold tracking-tight lg:text-base">
                {player.value}{" "}
                <span className="text-xs font-normal text-gray-600 lg:text-sm dark:text-gray-400">
                  {unit(player.value)}
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
