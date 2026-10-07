import Link from "next/link";
import { Award, BarChart3, Clock, Star, Target, ThumbsDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { HomeData } from "../types";
import { EmptyState } from "@/components/app/empty-state";

type Stat = { icon: LucideIcon; label: string; value: string | number };

/** Team totals for a coach, the player's own totals for a player. */
export function KeyStats({ teamStats, playerStats }: Pick<HomeData, "teamStats" | "playerStats">) {
  const stats: Stat[] | null = playerStats
    ? playerStats.matches === 0
      ? null
      : [
          { icon: BarChart3, label: "Matchs joués", value: playerStats.matches },
          { icon: Target, label: "Buts", value: playerStats.goals },
          { icon: TrendingUp, label: "Passes décisives", value: playerStats.assists },
          { icon: Award, label: "Total G+A", value: playerStats.contributions },
          { icon: Star, label: "Note moyenne", value: playerStats.averageRating?.toFixed(2) ?? "-" },
          { icon: Clock, label: "Minutes jouées", value: playerStats.minutesPlayed },
        ]
    : teamStats.matches === 0
      ? null
      : [
          { icon: BarChart3, label: "Matchs joués", value: teamStats.matches },
          { icon: Award, label: "Victoires", value: teamStats.wins },
          { icon: BarChart3, label: "Nuls", value: teamStats.draws },
          { icon: ThumbsDown, label: "Défaites", value: teamStats.losses },
          { icon: Target, label: "Points", value: teamStats.points },
          { icon: TrendingUp, label: "Taux de victoire", value: `${teamStats.winRate}%` },
        ];

  if (!stats) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Aucune statistique disponible"
        bare
        description="Les statistiques apparaîtront après les premiers matchs joués"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4 flex justify-end lg:mb-6">
        <Link href="/app/stats" className="text-sm font-semibold tracking-tight hover:underline md:text-base lg:text-lg">
          Stats club →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-gray-200/60 p-4 transition-shadow hover:shadow-md md:gap-4 md:rounded-2xl md:p-5 lg:p-6 dark:border-gray-700/50"
          >
            <Icon className="size-6 shrink-0 text-gray-700 md:size-7 lg:size-8 dark:text-gray-300" />
            <div className="flex flex-col">
              <p className="text-xs font-medium tracking-tight text-gray-600 md:text-sm lg:text-base dark:text-gray-400">
                {label}
              </p>
              <p className="text-lg font-bold tracking-tight md:text-xl lg:text-2xl">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
